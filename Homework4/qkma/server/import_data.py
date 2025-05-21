import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_qikai

stock_name_collection = db.get_collection("stock_list")
tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']
stockCategory = {
    'XOM': 'Energy', 'CVX': 'Energy', 'HAL': 'Energy',
    'MMM': 'Industrials', 'CAT': 'Industrials', 'DAL': 'Industrials',
    'MCD': 'Consumer Discretionary/Staples', 'NKE': 'Consumer Discretionary/Staples',
    'KO': 'Consumer Discretionary/Staples', 'JNJ': 'Healthcare', 'PFE': 'Healthcare',
    'UNH': 'Healthcare', 'JPM': 'Financials', 'GS': 'Financials', 'BAC': 'Financials',
    'AAPL': 'Information Tech/Comm.Sec', 'MSFT': 'Information Tech/Comm.Sec',
    'NVDA': 'Information Tech/Comm.Sec', 'GOOGL': 'Information Tech/Comm.Sec', 'META': 'Information Tech/Comm.Sec'
}
async def import_tickers_to_mongodb():
    # Insert the tickers into the collection
    await stock_name_collection.replace_one(
        {"_id": "ticker_list"},
        {"_id": "ticker_list", "tickers": tickers},
        upsert=True 
    )
    print("Tickers inserted or updated successfully.")

# Import stock data to MongoDB
stock_data_collection = db.get_collection("stock_data")
async def import_stockcsv_to_mongodb():
    for ticker in tickers:
        filePath = f"data/stockdata/{ticker}.csv"
        if not os.path.exists(filePath):
            print(f"Not found: {filePath}")
            continue

        df = pd.read_csv(filePath)

        # version1
        document = {
            "ticker": ticker,
            "date": df["Date"].tolist(),
            "open": df["Open"].tolist(),
            "high": df["High"].tolist(),
            "low": df["Low"].tolist(),
            "close": df["Close"].tolist()
        }
        await stock_data_collection.replace_one(
            {"ticker": ticker},
            document,
            upsert=True
        )
        print(f"Insert data {ticker}")

# Import stock news to MongoDB
stock_news_collection = db.get_collection("stock_news")
async def import_news_to_mongodb():
    newsPath = "data/stocknews/"
    for stock_name in os.listdir(newsPath):
        stock_folder = os.path.join(newsPath, stock_name)
        if not os.path.isdir(stock_folder):
            continue
        for news_file in os.listdir(stock_folder):
            if news_file.endswith(".txt"):
                news_path = os.path.join(stock_folder, news_file)
                with open(news_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                news_title = os.path.splitext(news_file)[0]
                news_id = f"{stock_name}_{news_title}"
                news_doc = {
                    "_id": news_id,
                    "stock": stock_name,
                    "title": news_title,
                    "content": content,
                }
                await stock_news_collection.replace_one(
                    {"_id": news_id},
                    news_doc,
                    upsert=True
                )
                print(f"Inserted news: {stock_name} - {news_title}")

# Import tsne and combine with ticker and category
tsne_collection = db.get_collection("tsne_data")
async def import_tsne_to_mongodb():
    tsne_path = "data/tsne.csv"  
    if not os.path.exists(tsne_path):
        print(f"Not found: {tsne_path}")
        return

    df = pd.read_csv(tsne_path)

    if len(df) != len(tickers):
        print(f"Mismatch: CSV rows = {len(df)}, tickers = {len(tickers)}")
        return

    for i, ticker in enumerate(tickers):
        row = df.iloc[i]
        category = stockCategory.get(ticker, "Unknown")
        doc = {
            "_id": ticker,
            "ticker": ticker,
            "x": float(row["Dim1"]),
            "y": float(row["Dim2"]),
            "category": category
        }
        await tsne_collection.replace_one(
            {"_id": ticker},
            doc,
            upsert=True
        )
        print(f"Inserted t-SNE: {ticker}")

async def main():
    await import_tickers_to_mongodb()
    await import_stockcsv_to_mongodb()
    await import_news_to_mongodb()
    await import_tsne_to_mongodb()

if __name__ == "__main__":
    asyncio.run(main())
