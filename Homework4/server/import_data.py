import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import json


client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_sd 

stock_name_collection = db.get_collection("stock_list")
stock_data_collection = db.get_collection("stock_data")
news_data_collection = db.get_collection("news_data")
tsne_data_collection = db.get_collection("tsne_data")

tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

async def import_tickers_to_mongodb():
    await stock_name_collection.delete_many({})
    # Insert the tickers into the collection
    await stock_name_collection.insert_one({
        "tickers": sorted(tickers)
    })

async def import_stock_prices():
    await stock_data_collection.delete_many({})
    for f in os.listdir('./data/stockdata'):
        if f[-4:] != '.csv':
            continue
        ticker = f[:-4]
        prices_df = pd.read_csv(f'./data/stockdata/{f}')
        price_list = [{'date': row.Date,
                       'Open': row.Open,
                       'High': row.High,
                       'Low': row.Low,
                       'Close': row.Close} for row in prices_df.itertuples()]
        await stock_data_collection.insert_one({'ticker': ticker, 'data': price_list})


async def import_tsne_data():
    tsne_df = pd.read_csv('./data/tsne.csv')
    records = []
    for row in tsne_df.itertuples(index=False):
        records.append({
            'Stock': row.Ticker,
            'x': row[0],  # first column (0)
            'y': row[1]   # second column (1)
        })
    await tsne_data_collection.delete_many({})
    await tsne_data_collection.insert_many(records)


async def import_news_articles():
    await news_data_collection.delete_many({})

    news_root = './data/stocknews'

    for ticker in os.listdir(news_root):
        ticker_dir = os.path.join(news_root, ticker)
        if not os.path.isdir(ticker_dir):
            continue

        for filename in os.listdir(ticker_dir):
            file_path = os.path.join(ticker_dir, filename)

            if not filename.endswith(".txt") or not os.path.isfile(file_path):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    text = file.read()

                lines = text.strip().split('\n')
                title_line = next((line for line in lines if line.startswith("Title: ")), None)
                date_line = next((line for line in lines if line.startswith("Date: ")), None)

                if not title_line or not date_line:
                    print(f"Skipping {filename}: Missing title or date line.")
                    continue

                title = title_line.replace("Title: ", "").strip()
                date = date_line.replace("Date: ", "").strip().split()[0]  # Only date portion, no time

                # Find start of content after the header lines
                content_start_index = text.find("\n\n")
                content = text[content_start_index + 2:].strip() if content_start_index != -1 else ""

                await news_data_collection.insert_one({
                    'Stock': ticker,
                    'Title': title,
                    'Date': date,
                    'content': content
                })

            except Exception as e:
                print(f"Failed to process {file_path}: {e}")

if __name__ == "__main__":
    async def main():
        await import_tickers_to_mongodb()
        await import_stock_prices()
        await import_news_articles()
        await import_tsne_data()
    asyncio.run(main())
