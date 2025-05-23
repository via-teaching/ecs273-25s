import csv
import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

from data_scheme import StockModelUnit, StockNewsModel, StockNewsModelList, tsneDataModel


# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_vibha
collection = db.get_collection("stock_data_vibha")
stock_name_collection = db.get_collection("stock_list")
tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

stock_list_collection = db.get_collection("stock_list")
stock_data_collection = db.get_collection("stock_data")
news_collection = db.get_collection("stock_news")
tsne_collection = db.get_collection("stock_tsne_data")

DATA_DIR = "data/stockdata"
NEWS_DATA_DIR = "data/stocknews"

async def import_tickers_to_mongodb():
    # Insert the tickers into the collection
    await stock_name_collection.insert_one({
        "tickers": tickers
    })

async def get_tickers():
    doc = await stock_list_collection.find_one()
    return doc["tickers"] if doc and "tickers" in doc else []

async def import_one_ticker(ticker: str):
    filepath = os.path.join(DATA_DIR, f"{ticker}.csv")
    if not os.path.exists(filepath):
        print(f"⚠️ File not found: {filepath}")
        return

    with open(filepath, "r") as f:
        reader = csv.DictReader(f)
        stock_series = []
        for i, row in enumerate(reader):
            stock_unit = StockModelUnit(
                index=str(i),
                Open=float(row["Open"]),
                High=float(row["High"]),
                Low=float(row["Low"]),
                Close=float(row["Close"]),
            )
            stock_series.append(stock_unit.model_dump())

        await stock_data_collection.replace_one(
            {"name": ticker},
            {"name": ticker, "stock_series": stock_series},
            upsert=True
        )
        print(f"Inserted {ticker} with {len(stock_series)} entries.")

async def import_stock_data():
    tickers = await get_tickers()
    for ticker in tickers:
        await import_one_ticker(ticker)

async def load_news_for_ticker(ticker: str):
    folder = os.path.join(NEWS_DATA_DIR, ticker)
    if not os.path.exists(folder):
        print(f"[Warning] Folder not found for ticker: {ticker}")
        return

    news_items = []

    for file_name in os.listdir(folder):
        if not file_name.endswith(".txt"):
            continue

        file_path = os.path.join(folder, file_name)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Extract title and date
            title_line = next((l for l in lines if l.startswith("Title:")), None)
            date_line = next((l for l in lines if l.startswith("Date:")), None)

            if not title_line or not date_line:
                print(f"[Skipping] Missing Title or Date in {file_path}")
                continue

            title = title_line.replace("Title:", "").strip()
            date = date_line.replace("Date:", "").strip()

            # Combine remaining lines into content, skipping first 3 lines
            content = "".join(lines[3:]).strip()

            news_items.append(StockNewsModel(
                Stock=ticker,
                Title=title,
                Date=date,
                content=content
            ).model_dump())

        except Exception as e:
            print(f"[Error] Failed to read {file_path}: {e}")

    if news_items:
        await news_collection.insert_one(StockNewsModelList(
            Stock=ticker,
            News=news_items
        ).model_dump())
        print(f"[Success] Inserted {len(news_items)} articles for {ticker}")
    else:
        print(f"[Info] No valid articles found for {ticker}")

async def import_news_data():
    await asyncio.gather(*(load_news_for_ticker(ticker) for ticker in tickers))

async def import_tsne_data():
    path = "data/tsne.csv"
    data = []

    with open(path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                record = tsneDataModel(
                    Stock=row["Ticker"],
                    tsne1=float(row["TSNE1"]),
                    tsne2=float(row["TSNE2"]),
                    Category=row["Category"]
                )
                data.append(record.model_dump(by_alias=True))
            except Exception as e:
                print(f"Skipping row due to error: {e}, row: {row}")
    if data:
        result = await tsne_collection.insert_many(data)
        print(f"Inserted {len(result.inserted_ids)} documents.")
    else:
        print("No valid data to insert.")

async def main():
    await import_tickers_to_mongodb()
    await import_stock_data()
    await import_news_data()
    await import_tsne_data()
    print("All data imported successfully.")

if __name__ == "__main__":
    asyncio.run(main())
