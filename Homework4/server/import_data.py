import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_gurjash

# MongoDB collections
stock_name_collection = db.get_collection("stock_list")
stock_data_collection = db.get_collection("stock_values")
stock_news_collection = db.get_collection("stock_news")
tsne_collection = db.get_collection("tsne_data")

tickers = [
    'XOM', 'CVX', 'HAL',
    'MMM', 'CAT', 'DAL',
    'MCD', 'NKE', 'KO',
    'JNJ', 'PFE', 'UNH',
    'JPM', 'GS', 'BAC',
    'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_folder = os.path.join(BASE_DIR, "data", "stockdata")
news_folder = os.path.join(BASE_DIR, "data", "stocknews")
tsne_file = os.path.join(BASE_DIR, "data", "tsne.csv")


# Insert stock ticker list
async def import_tickers_to_mongodb():
    await stock_name_collection.delete_many({})
    await stock_name_collection.insert_one({
        "tickers": tickers
    })

# Insert stock historical prices
async def import_stock_data_v2():
    for ticker in tickers:
        file_path = os.path.join(data_folder, f"{ticker}.csv")

        if not os.path.exists(file_path):
            continue

        df = pd.read_csv(file_path).dropna()

        stock_series = [
            {
                "date": row["Date"],
                "Open": float(row["Open"]),
                "High": float(row["High"]),
                "Low": float(row["Low"]),
                "Close": float(row["Close"])
            }
            for _, row in df.iterrows()
        ]

        document = {
            "name": ticker,
            "stock_series": stock_series
        }

        await stock_data_collection.delete_many({"name": ticker})
        await stock_data_collection.insert_one(document)


# Insert news articles from .txt files
async def import_news_from_txt():
    for ticker in tickers:
        ticker_folder = os.path.join(news_folder, ticker)
        if not os.path.exists(ticker_folder):
            continue

        for file in os.listdir(ticker_folder):
            if not file.endswith(".txt"):
                continue

            file_path = os.path.join(ticker_folder, file)
            with open(file_path, "r", encoding="utf-8") as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]

            title = next((l for l in lines if l.startswith("Title:")), "").replace("Title:", "").strip()
            date = next((l for l in lines if l.startswith("Date:")), "").replace("Date:", "").strip()
            url = next((l for l in lines if l.startswith("URL:")), "").replace("URL:", "").strip()

            content_start = 0
            for i, line in enumerate(lines):
                if line.startswith("URL:") or line.lower().startswith("content:"):
                    content_start = i + 1
                    break

            content = "\n".join(lines[content_start:]).strip()

            doc = {
                "Stock": ticker,
                "Title": title,
                "Date": date,
                "URL": url,
                "content": content
            }

            existing = await stock_news_collection.find_one({"Stock": ticker, "Title": title, "Date": date})
            if not existing:
                await stock_news_collection.insert_one(doc)
        


# Insert tsne.csv contents
async def import_tsne_data():
    if not os.path.exists(tsne_file):
        return

    df = pd.read_csv(tsne_file).dropna()

    await tsne_collection.delete_many({})  # clear previous data

    for _, row in df.iterrows():
        doc = {
            "Sector": row["Sector"],
            "Stock": row["Ticker"],
            "x": float(row["x"]),
            "y": float(row["y"])
        }
        await tsne_collection.insert_one(doc)


# Main
if __name__ == "__main__":
    async def run_all():
        await import_tickers_to_mongodb()
        await import_stock_data_v2()
        await import_news_from_txt()
        await import_tsne_data()

    asyncio.run(run_all())
