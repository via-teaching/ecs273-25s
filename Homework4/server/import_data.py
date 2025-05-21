import os
import csv
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_qiatan

tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META' ]

async def import_tickers():
    await db["stock_list"].delete_many({})
    await db["stock_list"].insert_one({"tickers": tickers})


news_folder = os.path.join("data", "stocknews")
# collection = db["news"]
async def import_news():
    await db["news"].delete_many({})
    print("🧹 Cleared old news collection.")

    total_count = 0

    for stock in os.listdir(news_folder):
        stock_path = os.path.join(news_folder, stock)
        if not os.path.isdir(stock_path):
            continue

        print(f"📁 Found stock folder: {stock}")

        for filename in os.listdir(stock_path):
            if not filename.endswith(".txt"):
                continue

            filepath = os.path.join(stock_path, filename)
            with open(filepath, "r") as f:
                content = f.read().strip()

            parsed_title = filename.replace(".txt", "").replace("_", " ").strip()
            parsed_date = "1970-01-01 00:00"

            try:
                parts = filename.replace(".txt", "").split("_", 2)
                if len(parts) >= 3:
                    date_str, time_str, title = parts
                    dt = datetime.strptime(date_str + time_str, "%Y%m%d%H%M")
                    parsed_title = title.replace("_", " ").strip()
                    parsed_date = dt.strftime("%Y-%m-%d %H:%M")
            except Exception as e:
                print(f"Failed to parse datetime from filename '{filename}': {e}")

            doc = {
                "Stock": stock,
                "Title": parsed_title,
                "Date": parsed_date,
                "content": content
            }

            await db["news"].insert_one(doc)
            total_count += 1



async def import_stock_prices():
    collection = db["stock_prices"]
    await collection.delete_many({})

    data_folder = os.path.join("data", "stockdata")

    for filename in os.listdir(data_folder):
        if filename.endswith(".csv"):
            ticker = filename.replace(".csv", "")
            filepath = os.path.join(data_folder, filename)

            with open(filepath, "r") as f:
                reader = csv.DictReader(f)
                prices = []

                for row in reader:
                    try:
                        prices.append({
                            "Date": row["Date"].split()[0],
                            "Open": float(row["Open"]),
                            "High": float(row["High"]),
                            "Low": float(row["Low"]),
                            "Close": float(row["Close"]),
                            "Volume": int(float(row["Volume"]))
                        })
                    except Exception as e:
                        print(f"Error in {filename}: {e}")

                doc = {
                    "Ticker": ticker,
                    "Prices": prices
                }

                await collection.insert_one(doc)

async def import_tsne():
    import pandas as pd

    collection = db["tsne"]
    await collection.delete_many({})

    tsne_path = os.path.join("data", "tsne.csv")
    if not os.path.exists(tsne_path):
        return

    df = pd.read_csv(tsne_path)
    count = 0

    for _, row in df.iterrows():
        doc = {
            "Stock": row["stock"],
            "x": float(row["x"]),
            "y": float(row["y"])
        }
        await collection.insert_one(doc)
        count += 1


async def main():
    await import_tickers()
    await import_stock_prices()
    await import_news()
    await import_tsne()

if __name__ == "__main__":
    asyncio.run(main())
