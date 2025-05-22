import os
import pandas as pd
import re
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["stock_YT"]  # Ensure this matches stock_[your_abbr]

# Collection handles
stock_list_col = db.get_collection("stock_list")
prices_col     = db.get_collection("prices_v2")
news_col       = db.get_collection("news")

# List of tickers to import
tickers = [
    'XOM','CVX','HAL','MMM','CAT','DAL','MCD','NKE','KO',
    'JNJ','PFE','UNH','JPM','GS','BAC','AAPL','MSFT','NVDA','GOOGL','META'
]

async def import_tickers():
    await stock_list_col.delete_many({})
    await stock_list_col.insert_one({"tickers": tickers})
    print(f"Imported {len(tickers)} tickers.")

async def import_prices_v2():
    for symbol in tickers:
        csv_path = os.path.join("data", "stockdata", f"{symbol}.csv")
        if not os.path.exists(csv_path):
            print(f"[WARN] CSV not found for {symbol}, skipping.")
            continue
        df = pd.read_csv(csv_path)
        records = []
        for _, row in df.iterrows():
            dt = datetime.fromisoformat(str(row['Date']).replace(' ', 'T'))
            records.append({
                "date":  dt,
                "open":  float(row['Open']),
                "high":  float(row['High']),
                "low":   float(row['Low']),
                "close": float(row['Close']),
            })
        doc = {"symbol": symbol, "records": records}
        await prices_col.replace_one({"symbol": symbol}, doc, upsert=True)
        print(f"Imported {len(records)} price points for {symbol}.")

async def import_news():
    base_dir = os.path.join("data", "stocknews")
    if not os.path.isdir(base_dir):
        print(f"[WARN] News base dir not found: {base_dir}")
        return

    for symbol in tickers:
        folder = os.path.join(base_dir, symbol)
        if not os.path.isdir(folder):
            continue
        for fname in os.listdir(folder):
            if not fname.endswith('.txt'):
                continue
            path = os.path.join(folder, fname)
            name = os.path.splitext(fname)[0]

            # Pattern 1: compact YYYYMMDD_HHMM_Title
            m1 = re.match(r'^(?P<date>\d{8})_(?P<hourmin>\d{4})_(?P<title>.+)$', name)
            if m1:
                date_str = m1.group('date')        # e.g. '20250414'
                time_str = m1.group('hourmin')      # e.g. '2317'
                title    = m1.group('title').rstrip('_')
                try:
                    published = datetime.strptime(date_str + time_str, '%Y%m%d%H%M')
                except ValueError:
                    print(f"[ERROR] Invalid timestamp from '{name}'")
                    continue
            else:
                # Pattern 2: 'YYYY-MM-DD HH:MM Title...'
                m2 = re.match(r'^(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s+(.+)$', name)
                if m2:
                    timestamp_str = m2.group('timestamp')
                    title = name[len(timestamp_str) + 1:]
                    try:
                        published = datetime.fromisoformat(timestamp_str.replace(' ', 'T'))
                    except ValueError:
                        print(f"[ERROR] Invalid timestamp '{timestamp_str}' in filename: {fname}")
                        continue
                else:
                    print(f"[WARN] Unexpected filename format: {fname}")
                    continue

            # Read file content
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as e:
                print(f"[ERROR] Failed to read {path}: {e}")
                continue

            article = {
                "symbol":      symbol,
                "publishedAt": published,
                "title":       title,
                "content":     content,
            }
            await news_col.replace_one(
                {"symbol": symbol, "publishedAt": published, "title": title},
                article,
                upsert=True
            )
            print(f"Imported news for {symbol} @ {published} -> {title}")

async def main():
    await import_tickers()
    await import_prices_v2()
    await import_news()

if __name__ == '__main__':
    asyncio.run(main())


