import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime, timedelta
import random


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")

# Stock categories
categories = {
    'Energy':       ['XOM', 'CVX', 'HAL'],
    'Industrials':  ['MMM', 'CAT', 'DAL'],
    'Consumer':     ['MCD', 'NKE', 'KO'],
    'Healthcare':   ['JNJ', 'PFE', 'UNH'],
    'Financials':   ['JPM', 'GS', 'BAC'],
    'Tech':         ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']
}


categoryOf = {}
for sector, tickers in categories.items():
    for ticker in tickers:
        categoryOf[ticker] = sector

# MongoDB 
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_manami

stock_name_collection = db.get_collection("stock_list")
tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

async def import_stock_data():
    path = os.path.join(DATA_DIR, "stockdata")
    # print(f"Looking for stock data in: {path}")
    for file in os.listdir(path):
        if not file.endswith(".csv"):
            continue

        ticker = file.replace(".csv", "").upper()
        df = pd.read_csv(os.path.join(path, file), parse_dates=["Date"])
        df = df.dropna(subset=["Date"])  
        df.rename(columns={
            "Date": "date", "Open": "open", "High": "high",
            "Low": "low", "Close": "close", "Volume": "volume"
        }, inplace=True)

        prices = df.to_dict(orient="records")
        doc = {
            "ticker": ticker,
            "sector": None,
            "prices": prices
        }

        await db.stocks.replace_one({"ticker": ticker}, doc, upsert=True)
        print(f"Imported stock: {ticker}")

async def import_tsne_data():
    tsne_path = os.path.join(DATA_DIR, "tsne.csv")
    print(f"Looking for TSNE data in: {tsne_path}")
    df = pd.read_csv(tsne_path)

    for _, row in df.iterrows():
        ticker = row["ticker"]
        await db.stocks.update_one(
            {"ticker": ticker},
            {"$set": {
                "tsne": {"x": row["x"], "y": row["y"]},
                "sector": categoryOf.get(ticker, "Other")
            }}
        )

    print("t-SNE data imported")

async def import_news_data():
    root = os.path.join(DATA_DIR, "stocknews")
    print(f"Looking for news data in: {root}")
    for ticker in os.listdir(root):
        folder = os.path.join(root, ticker)
        if not os.path.isdir(folder):
            continue

        for file in os.listdir(folder):
            if file.endswith(".txt"):
                with open(os.path.join(folder, file), 'r') as f:
                    content = f.read()
                
            
                date_str = file.split("_")[0]
                date = datetime.strptime(date_str, "%Y-%m-%d %H-%M")
   
                title = "_".join(file.split("_")[1:]).replace(".txt", "")
                
          
                url = None
                for line in content.split("\n"):
                    if line.startswith("URL:"):
                        url = line.replace("URL:", "").strip()
                        break
                
                news_doc = {
                    "_id": f"{ticker}_{date_str}_{title}",
                    "ticker": ticker,
                    "date": date,
                    "title": title,
                    "content": content,
                    "url": url or "https://none" 
                }
                await db.news.replace_one({"_id": news_doc["_id"]}, news_doc, upsert=True)
        print(f"Imported news: {ticker}")

async def main():

    await db.stocks.delete_many({})
    await db.news.delete_many({})
    
   a
    await import_stock_data()
    await import_tsne_data()
    await import_news_data()
    print("===== stock, tsne, news data imported =====")

# async def import_tickers_to_mongodb():
#     # Insert the tickers into the collection
#     await stock_name_collection.insert_one({
#         "tickers": tickers
#     })



if __name__ == "__main__":
    asyncio.run(main())
