import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_zlihuang

stock_name_collection = db.get_collection("stock_list")
stock_data_collection = db.get_collection("stock_data_v2")  
stock_news_collection = db.get_collection("stock_news")
tsne_collection = db.get_collection("tsne_data")     
tickers = [
    'XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL',
    'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'UNH',
    'JPM', 'GS', 'BAC', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]

async def import_tickers_to_mongodb():
    await stock_name_collection.delete_many({})
    # Insert the tickers into the collection
    await stock_name_collection.insert_one({
        "tickers": tickers
    })
    print("[INFO] Ticker list imported.")


async def import_stock_data():
    stock_folder = "data/stockdata"
    await stock_data_collection.delete_many({})  
    for ticker in tickers:
        file_path = os.path.join(stock_folder, f"{ticker}.csv")
        if not os.path.exists(file_path):
            print(f"[WARNING] File not found for {ticker}")
            continue
        df = pd.read_csv(file_path)
        if not {"Date", "Open", "High", "Low", "Close"}.issubset(df.columns):
            print(f"[WARNING] Missing OHLC columns in {file_path}")
            continue
        stock_series = df[["Date", "Open", "High", "Low", "Close"]].to_dict("records")
        await stock_data_collection.insert_one({
            "name": ticker,
            "stock_series": stock_series
        })
        print(f"[INFO] Stock data imported for {ticker}")


async def import_news_data():
    news_folder = "data/stocknews"
    await stock_news_collection.delete_many({})  
    for ticker in tickers:
        stock_dir = os.path.join(news_folder, ticker)
        if not os.path.isdir(stock_dir):
            print(f"[WARNING] No news folder for {ticker}")
            continue
        for filename in os.listdir(stock_dir):
            if filename.endswith(".txt"):
                filepath = os.path.join(stock_dir, filename)
                with open(filepath, encoding="utf-8") as f:
                    lines = f.readlines()
                if len(lines) < 3:
                    continue
                title, date, url = lines[:3]
                content = "".join(lines[3:]).strip()
                await stock_news_collection.insert_one({
                    "Stock": ticker,
                    "Title": title.strip(),
                    "Date": date.strip(),
                    "content": content
                })
        print(f"[INFO] News data imported for {ticker}")

async def import_tsne_data():
    df = pd.read_csv("data/tsne.csv")
    df["Stock"] = tickers
    df = df[["Stock", "x", "y"]]
    await tsne_collection.delete_many({}) 
    await tsne_collection.insert_many(df.to_dict("records"))
    print("[INFO] t-SNE data imported.")


async def main():
    await import_tickers_to_mongodb()
    await import_stock_data()
    await import_news_data()
    await import_tsne_data()

if __name__ == "__main__":
    asyncio.run(main())
