import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_srisingh

TICKERS = ['XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 'MCD', 'NKE', 'KO', 'JNJ',
           'PFE', 'UNH', 'JPM', 'GS', 'BAC', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

async def import_stock_list():
    stock_list = db.get_collection("stock_list")
    await stock_list.delete_many({})
    await stock_list.insert_one({"tickers": TICKERS})
    print("Stock list inserted.")

async def import_stock_prices():
    collection = db.get_collection("stock_v2")
    await collection.delete_many({})
    for ticker in TICKERS:
        path = f"data/stockdata/{ticker}.csv"
        if not os.path.exists(path):
            print(f"Skipping {ticker}: file not found.")
            continue
        df = pd.read_csv(path)
        df = df.dropna(subset=["Date", "Open", "High", "Low", "Close"])
        stock_series = df[["Date", "Open", "High", "Low", "Close"]].to_dict("records")
        await collection.insert_one({
            "name": ticker,
            "stock_series": stock_series
        })
    print("Stock price data inserted.")

async def import_stock_news():
    collection = db.get_collection("stock_news")
    await collection.delete_many({})
    for ticker in TICKERS:
        dir_path = f"data/stocknews/{ticker}"
        if not os.path.exists(dir_path):
            print(f"Skipping news for {ticker}: folder not found.")
            continue
        for file in os.listdir(dir_path):
            if file.endswith(".txt"):
                with open(os.path.join(dir_path, file), "r") as f:
                    lines = f.readlines()
                    title = next((l.replace("Title: ", "").strip() for l in lines if l.startswith("Title:")), None)
                    date = next((l.replace("Date: ", "").strip() for l in lines if l.startswith("Date:")), None)
                    content = "".join(lines[3:]).strip()
                    if title and date:
                        await collection.insert_one({
                            "Stock": ticker,
                            "Title": title,
                            "Date": date,
                            "content": content
                        })
    print("Stock news inserted.")

async def import_tsne():
    collection = db.get_collection("tsne")
    await collection.delete_many({})
    path = "data/tsne.csv"
    if os.path.exists(path):
        df = pd.read_csv(path)
        for _, row in df.iterrows():
            await collection.insert_one({
                "Stock": row["ticker"],
                "x": float(row["x"]),
                "y": float(row["y"]),
                "sector": row.get("sector", "Unknown")
            })
        print("t-SNE data inserted.")
    else:
        print("t-SNE CSV file not found.")

# ONE event loop call only
async def main():
    await import_stock_list()
    await import_stock_prices()
    await import_stock_news()
    await import_tsne()

if __name__ == "__main__":
    asyncio.run(main())
