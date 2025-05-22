import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_hrahman

tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

SECTOR_COLORS = {
    "Energy": "#1f77b4",
    "Industrials": "#ff7f0e",
    "Staples": "#2ca02c",
    "Healthcare": "#d62728",
    "Financials": "#9467bd",
    "Tech": "#8c564b"
}

ticker_to_sector = {
    'XOM': "Energy", 'CVX': "Energy", 'HAL': "Energy",
    'MMM': "Industrials", 'CAT': "Industrials", 'DAL': "Industrials",
    'MCD': "Staples", 'NKE': "Staples", 'KO': "Staples",
    'JNJ': "Healthcare", 'PFE': "Healthcare", 'UNH': "Healthcare",
    'JPM': "Financials", 'GS': "Financials", 'BAC': "Financials",
    'AAPL': "Tech", 'MSFT': "Tech",
    'NVDA': "Tech", 'GOOGL': "Tech", 'META': "Tech"
}

async def import_tickers_to_mongodb():
    stock_name_collection = db.get_collection("stock_list")
    await stock_name_collection.delete_many({})
    await stock_name_collection.insert_one({
        "tickers": tickers
    })

async def import_stock_price_data():
    stock_coll = db.get_collection("price_data")
    await stock_coll.delete_many({})

    for ticker in tickers:
        path = f"./data/stockdata/{ticker}.csv"
        if not os.path.exists(path):
            print(f"Skipping missing file: {path}")
            continue
        df = pd.read_csv(path)
        df["name"] = ticker
        records = df.to_dict(orient="records")
        if records:
            await stock_coll.insert_many(records)
            print(f"Inserted {len(records)} records for {ticker}")


async def import_news_data():
    news_coll = db.get_collection("news_data")
    await news_coll.delete_many({})
    root = "./data/stocknews"
    for ticker in os.listdir(root):
        t_path = os.path.join(root, ticker)
        if not os.path.isdir(t_path): continue

        for fname in os.listdir(t_path):
            if not fname.endswith(".txt"): continue
            full_path = os.path.join(t_path, fname)

            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
            
            date_str = fname[:16]
            title = fname[17:].replace(".txt", "").replace("_", " ").strip()
            date_fmt = date_str.replace("-", ":", 2).replace("-", ":")
            date_fmt = date_fmt.replace(" ", "T")

            await news_coll.insert_one({
                "Stock": ticker,
                "Title": title,
                "Date": date_str,
                "content": content
            })

async def import_tsne_data():
    tsne_coll = db.get_collection("tsne_data")
    await tsne_coll.delete_many({})
    df = pd.read_csv("./data/tsne.csv")
    for _, row in df.iterrows():
        stock = row['label']
        sector = ticker_to_sector.get(stock)
        color = SECTOR_COLORS.get(sector, "#888")
        await tsne_coll.insert_one({
            "Stock": stock,
            "x": float(row['x']),
            "y": float(row['y']),
            "sector": sector,
            "color": color
        })

async def main():
    await import_tickers_to_mongodb()
    await import_stock_price_data()
    await import_news_data()
    await import_tsne_data()

if __name__ == "__main__":
    asyncio.run(main())
