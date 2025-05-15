import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_garchan

stock_name_collection = db.get_collection("stock_list")
tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

stock_price_collection = db.get_collection("stock_prices")
tsne_collection = db.get_collection("tsne_data")
news_collection = db.get_collection("stock_news")

async def import_tickers_to_mongodb():
    await stock_name_collection.delete_many({})
    # Insert the tickers into the collection
    await stock_name_collection.insert_one({
        "tickers": sorted(tickers)
    })

async def import_prices_to_mongodb():
    await stock_price_collection.delete_many({})
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
        await stock_price_collection.insert_one({'name': ticker, 'stock_series': price_list})

async def import_tsne_to_mongodb():
    await tsne_collection.delete_many({})
    tsne_df = pd.read_csv('./data/tsne.csv')
    await tsne_collection.insert_many([{'Stock': row.Ticker, 
                                        'x': row.tSNE_x,
                                        'y': row.tSNE_y} for row in tsne_df.itertuples()])

async def import_news_to_mongodb():
    await news_collection.delete_many({})
    for d in os.listdir('./data/stocknews'):
        if not os.path.isdir(f'./data/stocknews/{d}'):
            continue
        for f in os.listdir(f'./data/stocknews/{d}'):
            with open(f'./data/stocknews/{d}/{f}', 'r') as file:
                text = file.read()
                date_index = text.find('\n')      

                title = text[7: date_index]
                date = text[date_index+28 : date_index+38]
                content = text[date_index+45:]

                await news_collection.insert_one({
                    'Stock': d,
                    'Title': title,
                    'Date': date,
                    'content': content
                })

async def main():
    await import_tickers_to_mongodb()
    await import_prices_to_mongodb()
    await import_tsne_to_mongodb()
    await import_news_to_mongodb()

if __name__ == "__main__":
    asyncio.run(main())
