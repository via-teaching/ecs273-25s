import json
import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import nest_asyncio
# https://cloud.mongodb.com/v2/6826a4ec1158e05a9516d38b#/metrics/replicaSet/6826a54937f8857042310bb8/explorer/stock_ayee 
# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb+srv://alyssayee:123@cluster0.kdapobk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0") # mongodb://localhost:27017
db = client.stock_ayee

stock_name_collection = db.get_collection("stocklist")
stock_data_collection = db.get_collection("stockdata")
news_collection = db.get_collection("stocknews")
tsne_collection = db.get_collection("tsne")

tickers = [ 'XOM', 'CVX', 'HAL', 'MMM', 'CAT', 'DAL', 'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH', 'JPM', 'GS', 'BAC', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

async def import_tickers():
    await stock_name_collection.delete_many({})
    await stock_name_collection.insert_one({"tickers": tickers})

async def import_stockdata():
    await stock_data_collection.delete_many({})
    for file in os.listdir("data/stockdata"):
        ticker = file.replace(".csv", "")
        df = pd.read_csv(f"data/stockdata/{file}", skiprows=1)  # skips the 2nd row)
        # stock_series = df.to_dict("records")
        for _, row in df.iterrows():
            try:
                record = {
                    'Ticker': ticker,
                    'Date': row['Unnamed: 0'],
                    'Open': float(row[ticker]),
                    'High': float(row[f"{ticker}.1"]),
                    'Low': float(row[f"{ticker}.2"]),
                    'Close': float(row[f"{ticker}.3"]),
                    'Volume': int(row[f"{ticker}.4"]),
                }
                # print(record)
                await stock_data_collection.insert_one(record)
            except Exception as e:
                print("Skipping row due to error:", e, row)
    print("Finished importing all stock data.")

# async def import_stocknews():
#     await news_collection.delete_many({})
#     for ticker in os.listdir("data/stocknews"):
#         path = os.path.join("data/stocknews", ticker)
#         for file in os.listdir(path):
#             with open(os.path.join(path, file), "r") as f:
#                 data = json.load(f)
#                 data["Stock"] = ticker
#                 await news_collection.insert_one(data)
# async def import_stocknews():
#     news_dir = "data/stocknews"
#     news_collection = db.get_collection("stocknews")
#     # print("Columns in stocknews DataFrame:", df.columns.tolist())
#     # print("First row:", df.iloc[0].to_dict())
#     for ticker in os.listdir(news_dir):
#         ticker_dir = os.path.join(news_dir, ticker)
#         if os.path.isdir(ticker_dir):
#             for file in os.listdir(ticker_dir):
#                 if file.endswith(".csv"):
#                     df = pd.read_csv(os.path.join(ticker_dir, file))
#                     for _, row in df.iterrows():
#                         await news_collection.insert_one({
#                             "Stock": ticker,
#                             "Title": row["Title"],
#                             "Date": row["Date"],
#                             "content": row["Content"]
#                         })
#     print("Finished importing all stock news.")
# import os
# import datetime

# async def import_stocknews():
#     news_dir = "data/stocknews"
#     news_collection = db.get_collection("stocknews")

#     total_inserted = 0
#     for ticker in os.listdir(news_dir):
#         ticker_dir = os.path.join(news_dir, ticker)
#         if os.path.isdir(ticker_dir):
#             for file in os.listdir(ticker_dir):
#                 if file.endswith(".txt"):
#                     file_path = os.path.join(ticker_dir, file)
#                     with open(file_path, "r", encoding="utf-8") as f:
#                         content = f.read()
#                     # You might want to parse date or title from filename or content if available
#                     # For now, just store the filename as title and current datetime as date
#                     doc = {
#                         "Stock": ticker,
#                         "Title": file,            # Or parse title from content if possible
#                         "Date": datetime.datetime.now(),  # Replace with real date if you can parse
#                         "content": content
#                     }
#                     await news_collection.insert_one(doc)
#                     total_inserted += 1
#     print(f"Finished importing all stock news. Total inserted: {total_inserted}")
import os
import datetime

async def import_stocknews():
    news_dir = "data/stocknews"
    news_collection = db.get_collection("stocknews")

    total_inserted = 0
    for ticker in os.listdir(news_dir):
        ticker_dir = os.path.join(news_dir, ticker)
        if os.path.isdir(ticker_dir):
            for file in os.listdir(ticker_dir):
                if file.endswith(".txt"):
                    file_path = os.path.join(ticker_dir, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()

                    # Skip lines that start with "Title:", "Date:", or "URL:" and take the rest as content
                    content_lines = []
                    header_fields = ("Title:", "Date:", "URL:")
                    header_done = False
                    for line in lines:
                        # If line is empty or just newline, ignore
                        if not line.strip():
                            continue
                        # Once we see a line that does NOT start with header prefixes, assume content starts
                        if header_done or not any(line.startswith(h) for h in header_fields):
                            header_done = True
                            content_lines.append(line)

                    content = "".join(content_lines).strip()

                    doc = {
                        "Stock": ticker,
                        "Title": file,  # or parse from filename if you want
                        "Date": datetime.datetime.now(),  # Replace with actual date if you parse
                        "content": content
                    }
                    await news_collection.insert_one(doc)
                    total_inserted += 1

    print(f"Finished importing all stock news. Total inserted: {total_inserted}")


async def import_tsne():
    await tsne_collection.delete_many({})
    df = pd.read_csv("data/tsne.csv")
    print("Columns in tsne DataFrame:", df.columns.tolist())
    print("First row:", df.iloc[0].to_dict())
    tickers = [
    'XOM', 'CVX', 'HAL',  
    'MMM', 'CAT', 'DAL',  
    'MCD', 'NKE', 'KO',  
    'JNJ', 'PFE', 'UNH', 
    'JPM', 'GS', 'BAC',
    'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META' 
    ]
    for i, row in df.iterrows():
        await tsne_collection.insert_one({
            "Stock": tickers[i],
            "TSNE1": row["TSNE1"],
            "TSNE2": row["TSNE2"]
    })
    print("Finished importing all tsne.")

if __name__ == "__main__":
    nest_asyncio.apply()
    # asyncio.run(import_tickers())
    # asyncio.run(import_stockdata())
    asyncio.run(import_stocknews())
    # asyncio.run(import_tsne())
    