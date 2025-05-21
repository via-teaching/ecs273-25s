import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["stock_lyt"]

async def import_stockdata():
    folder = "data/stockdata"
    for file in os.listdir(folder):
        if file.endswith(".csv"):
            symbol = file[:-4]  
            df = pd.read_csv(os.path.join(folder, file))
            records = df.to_dict("records")
            await db.stockdata.insert_one({
                "Stock": symbol,
                "TimeSeries": records
            })

async def import_stocknews():
    from datetime import datetime
    import re

    root = "data/stocknews"
    for stock in os.listdir(root):
        stock_folder = os.path.join(root, stock)
        if not os.path.isdir(stock_folder):
            continue
        for file in os.listdir(stock_folder):
            if file.endswith(".txt"):
                full_path = os.path.join(stock_folder, file)
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()
                filename = file.replace(".txt", "")
                date_part, title_part = filename.split("_", 1)

                
                try:
                    date_obj = datetime.strptime(date_part, "%Y-%m-%d %H-%M")
                except ValueError:
                    date_obj = datetime.strptime(date_part.split()[0], "%Y-%m-%d")  

                await db.stocknews.insert_one({
                    "Stock": stock,
                    "Date": date_obj,
                    "Title": title_part.replace("_", " "),
                    "Content": content
                })

async def import_tsne():
    path = "data/tsne.csv"
    if os.path.exists(path):
        df = pd.read_csv(path)
        records = df.to_dict("records")
        await db.tsne.insert_many(records)

async def main():
    await import_stockdata()
    await import_stocknews()
    await import_tsne()

if __name__ == "__main__":
    asyncio.run(main())