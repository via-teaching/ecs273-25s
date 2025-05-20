import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
database = client.stock_vnsingh

# Constants
STOCK_TICKERS = [
    'XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL',
    'MCD', 'NKE', 'KO', 'JNJ', 'PFE', 'UNH',
    'JPM', 'GS', 'BAC', 'AAPL', 'MSFT', 'NVDA',
    'GOOGL', 'META'
]
SECTOR_COLORS = {
    "Energy": "#1f77b4",
    "Industrials": "#ff7f0e",
    "Staples": "#2ca02c",
    "Healthcare": "#d62728",
    "Financials": "#9467bd",
    "Tech": "#8c564b"
}

TICKER_TO_SECTOR = {
    'XOM': "Energy", 'CVX': "Energy", 'HAL': "Energy",
    'MMM': "Industrials", 'CAT': "Industrials", 'DAL': "Industrials",
    'MCD': "Staples", 'NKE': "Staples", 'KO': "Staples",
    'JNJ': "Healthcare", 'PFE': "Healthcare", 'UNH': "Healthcare",
    'JPM': "Financials", 'GS': "Financials", 'BAC': "Financials",
    'AAPL': "Tech", 'MSFT': "Tech", 'NVDA': "Tech",
    'GOOGL': "Tech", 'META': "Tech"
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

async def extract_title(filename: str) -> str:
    # Remove directory if present
       filename = filename.split('/')[-1]

    # Remove file extension
       filename = filename.replace(".txt", "")

    # Split by underscore
       parts = filename.split("_")

    # Start from the second `_` occurrence (i.e., index 2 onward)
       if len(parts) > 2:
        title = " ".join(parts[2:])
       else:
        title = " ".join(parts)

       return title


# Import stock tickers
async def insert_stock_ticker_list():
    collection = database.get_collection("stock_list")
    await collection.delete_many({})
    await collection.insert_one({"tickers": STOCK_TICKERS})
    print("Inserted stock tickers")


# Import stock price data
async def insert_price_data():
    collection = database.get_collection("price_data")
    await collection.delete_many({})

    for ticker in STOCK_TICKERS:
        csv_path = os.path.join(BASE_DIR, "data", "stockdata", f"{ticker}.csv")
        if not os.path.exists(csv_path):
            print(f"File not found: {csv_path}")
            continue
        df = pd.read_csv(csv_path)
        df["ticker"] = ticker
        records = df.to_dict(orient="records")
        if records:
            await collection.insert_many(records)
            print(f"{ticker}: Inserted {len(records)} records")


# Import news data
async def insert_news_articles():
    collection = database.get_collection("news_data")
    await collection.delete_many({})
    news_dir = os.path.join(BASE_DIR, "data", "stocknews")

    for ticker in os.listdir(news_dir):
        ticker_dir = os.path.join(news_dir, ticker)
        if not os.path.isdir(ticker_dir):
            continue

        for filename in os.listdir(ticker_dir):
            if not filename.endswith(".txt"):
                continue

            full_path = os.path.join(ticker_dir, filename)
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read().strip()

            date_str = filename[:16]
            title= await extract_title(filename)
            

            await collection.insert_one({
                "Stock": ticker,
                "Title": title,
                "Date": date_str,
                "content": content
            })
            print(f"Inserted news: {ticker} - {title}")



# Import TSNE data
async def insert_tsne_data():
    collection = database.get_collection("tsne_data")
    await collection.delete_many({})
    tsne_path = os.path.join(BASE_DIR,"data", "tsne.csv")

    df = pd.read_csv(tsne_path)
    for _, row in df.iterrows():
        ticker = row['stock']
        sector = TICKER_TO_SECTOR.get(ticker)
        color = SECTOR_COLORS.get(sector, "#888")
        await collection.insert_one({
            "Stock": ticker,
            "x": float(row['x']),
            "y": float(row['y']),
            "sector": sector,
            "color":color
        })
    print("Inserted t-SNE data")
 

# Main execution
async def main():
    await insert_stock_ticker_list()
    await insert_price_data()
    await insert_news_articles()
    await insert_tsne_data()
    print("✅ All data imported successfully.")


if __name__ == "__main__":
    asyncio.run(main())
