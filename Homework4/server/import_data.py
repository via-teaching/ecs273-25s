import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb+srv://studentUser:123@cluster0.58yt40u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client.stock_md

# these are the collections I created
stock_list_collection = db.get_collection("stock_list")
stock_price_collection = db.get_collection("stock_prices")
stock_news_collection = db.get_collection("news")
tsne_collection = db.get_collection("tsne_data")

tickers = [
    'XOM', 'CVX', 'HAL',
    'MMM', 'CAT', 'DAL',
    'MCD', 'NKE', 'KO',
    'JNJ', 'PFE', 'UNH',
    'JPM', 'GS', 'BAC',
    'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]

async def import_tickers():
    # clear existing tickers
    await stock_list_collection.delete_many({})
    # Insert the tickers into the collection
    await stock_list_collection.insert_one({"tickers": tickers})

async def import_stock_prices():
    # clear existing stock prices
    await stock_price_collection.delete_many({})

    for ticker in tickers:
        csv_path = f"data/stockdata/{ticker}.csv"
        if not os.path.exists(csv_path):
            print(f"File {csv_path} not found, skipping {ticker}")
            continue

        df = pd.read_csv(csv_path)

        stock_series = []
        for _, row in df.iterrows():
            stock_series.append({
                "date": row["Date"],
                "Open": row["Open"],
                "High": row["High"],
                "Low": row["Low"],
                "Close": row["Close"],
            })

        await stock_price_collection.insert_one({
            "name": ticker,
            "stock_series": stock_series
        })

import re
import os

async def import_news():
    # clear existing news
    await stock_news_collection.delete_many({})

    base_path = "data/stocknews"

    date_time_pattern = re.compile(r"(\d{4}-\d{2}-\d{2}) (\d{2}-\d{2})_")

    for ticker in tickers:
        news_folder = os.path.join(base_path, ticker)
        if not os.path.exists(news_folder):
            print(f"News folder {news_folder} not found, skipping {ticker}")
            continue

        for filename in os.listdir(news_folder):
            if filename.endswith(".txt"):
                file_path = os.path.join(news_folder, filename)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Extract date and time from filename
                match = date_time_pattern.match(filename)
                if match:
                    date = match.group(1)  # e.g. '2025-04-15'
                    time = match.group(2).replace('-', ':')  # e.g. '20:08'
                    datetime_str = f"{date} {time}"
                else:
                    datetime_str = ""  # fallback if pattern not matched

                # Use the rest of filename after the datetime as title
                # Remove the date + time + underscore prefix
                title = filename
                if match:
                    title = filename[match.end():]
                # remove the ".txt" extension from title
                title = title[:-4]

                await stock_news_collection.insert_one({
                    "Stock": ticker,
                    "Title": title,
                    "Date": datetime_str,
                    "content": content
                })


async def import_tsne():
    # clear existing TSNE data
    await tsne_collection.delete_many({})

    tsne_csv_path = "data/tsne.csv"
    if not os.path.exists(tsne_csv_path):
        print(f"TSNE CSV file {tsne_csv_path} not found, skipping TSNE import")
        return

    df = pd.read_csv(tsne_csv_path)

    tsne_docs = []
    for _, row in df.iterrows():
        tsne_docs.append({
            "x": float(row["Dim1"]),
            "y": float(row["Dim2"]),
            "Stock": row["Ticker"],
            "Category": row["Category"]
        })

    if tsne_docs:
        await tsne_collection.insert_many(tsne_docs)
        print(f"Inserted {len(tsne_docs)} TSNE records")

async def main():
    await import_tickers()
    await import_stock_prices()
    await import_news()
    await import_tsne()
    print("Import completed")

if __name__ == "__main__":
    asyncio.run(main())
