import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
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
    path = "server/data/stockdata"
    for file in os.listdir(path):
        if not file.endswith(".csv"):
            continue

        ticker = file.replace(".csv", "").upper()
        df = pd.read_csv(os.path.join(path, file), parse_dates=["Date"])
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
    df = pd.read_csv("server/data/tsne.csv")

    for _, row in df.iterrows():
        await db.stocks.update_one(
            {"ticker": row["ticker"]},
            {"$set": {
                "tsne": {"x": row["x"], "y": row["y"]},
                "sector": row.get("sector")
            }}
        )

    print("t-SNE data imported")

async def import_news_data():
    root = "server/data/stocknews"
    for ticker in os.listdir(root):
        folder = os.path.join(root, ticker)
        if not os.path.isdir(folder):
            continue

        for file in os.listdir(folder):
            if file.endswith(".csv"):
                df = pd.read_csv(os.path.join(folder, file), parse_dates=["Date"])
                for _, row in df.iterrows():
                    news_doc = {
                        "_id": row["URL"],
                        "ticker": ticker,
                        "date": row["Date"],
                        "title": row["Title"],
                        "url": row["URL"],
                        "content": row.get("Content", "")
                    }
                    await db.news.replace_one({"_id": news_doc["_id"]}, news_doc, upsert=True)
        print(f"Imported news: {ticker}")

async def main():
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
