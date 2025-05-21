import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection 
MONGO_URI = "mongodb+srv://iakahssay:ecs273@hw4.q7b31db.mongodb.net/?retryWrites=true&w=majority&appName=hw4"
client = AsyncIOMotorClient(MONGO_URI)
db = client["stock_Iman_K"] #Safer way to access it than "client.stock_Iman_K"

stock_name_collection = db.get_collection("stock_list")
tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

async def import_tickers_to_mongodb():
    # Insert the tickers into the collection
    await stock_name_collection.insert_one({
        "tickers": tickers
    })

"""
1) Reads CSVs from "/data/stockdata/*.csv"
2) Inserts both formats into two collections:
    a) stock_data_v1 -> for array-per-field (StockModelV1)
    b) stock_data_v2 -> for array-of-records (StockModelV2)
"""
async def import_stock_data():
    folder = "data/stockdata"
    v1_collection = db.get_collection("stock_data_v1")
    v2_collection = db.get_collection("stock_data_v2")

    for filename in os.listdir(folder):
        if filename.endswith(".csv"):
            ticker = filename.replace(".csv", "")
            df = pd.read_csv(os.path.join(folder, filename))

            # V1: separate arrays
            await v1_collection.insert_one({
                "name": ticker,
                "date": df["Date"].tolist(),
                "Open": df["Open"].tolist(),
                "High": df["High"].tolist(),
                "Low": df["Low"].tolist(),
                "Close": df["Close"].tolist()
            })

            # V2: list of records
            records = df[["Date", "Open", "High", "Low", "Close"]].to_dict("records")
            await v2_collection.insert_one({
                "name": ticker,
                "stock_series": records
            })

"""
1) Reads all .txt files from each stock folder
2) Parses the filename to get Date and Title
3) Inserts into stock_news collection

2) Reads all lines in the text file
3) Finds the line numbers/indices of Title:, Date:, and URL:, assuming:
    a. Title: may span multiple lines until Date: is encountered.
    b. Content: starts after URL: and one optional blank line.
"""
async def import_news_articles():
    news_collection = db.get_collection("stock_news")
    news_root = "data/stocknews"

    for stock in os.listdir(news_root):
        stock_folder = os.path.join(news_root, stock)
        if not os.path.isdir(stock_folder):
            continue

        for filename in os.listdir(stock_folder):
            if filename.endswith(".txt"):
                file_path = os.path.join(stock_folder, filename)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = [line.rstrip() for line in f]

                    # Find index positions
                    title_start = next((i for i, line in enumerate(lines) if line.startswith("Title:")), None)
                    date_index = next((i for i, line in enumerate(lines) if line.startswith("Date:")), None)
                    url_index = next((i for i, line in enumerate(lines) if line.startswith("URL:")), None)

                    if None in (title_start, date_index, url_index):
                        print(f"[WARN] Missing metadata fields in: {file_path}")
                        continue

                    # Multi-line title: lines from title_start to one before date_index
                    title_lines = lines[title_start:date_index]
                    title = " ".join(line.replace("Title:", "").strip() if i == title_start else line.strip()
                                        for i, line in enumerate(title_lines))

                    date = lines[date_index].replace("Date:", "").strip()
                    url = lines[url_index].replace("URL:", "").strip()

                    # Content: everything after URL and the next line (to skip blank)
                    content_start = url_index + 2 if url_index + 1 < len(lines) and lines[url_index + 1] == "" else url_index + 1
                    content = "\n".join(lines[content_start:]).strip()

                    await news_collection.insert_one({
                        "Stock": stock,
                        "Title": title,
                        "Date": date,
                        "URL": url,
                        "Content": content[9:]
                    })

                except Exception as e:
                    print(f"[ERROR] Failed to process {file_path}: {e}")


async def import_tsne_data():
    tsne_collection = db.get_collection("tsne_data")
    tsne_file = "data/tsne.csv"

    df = pd.read_csv(tsne_file)
    for _, row in df.iterrows():
        await tsne_collection.insert_one({
            "Ticker": row["Ticker"],
            "Dim1": float(row["Dim1"]),
            "Dim2": float(row["Dim2"]),
            "Category": row["Category"]
        })

if __name__ == "__main__":
    #asyncio.run(import_tickers_to_mongodb())
    async def main():
        await import_tickers_to_mongodb()
        await import_stock_data()
        await import_news_articles()
        await import_tsne_data()
        print("All data imported to MongoDB")

    asyncio.run(main())
