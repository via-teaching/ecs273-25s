import os
import csv
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_qiatan

# 股票代码列表
tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META' ]

# 1. 插入 stock_list
async def import_tickers():
    await db["stock_list"].delete_many({})
    await db["stock_list"].insert_one({"tickers": tickers})
    print("✅ Tickers inserted into stock_list")

# 2. 插入每只股票的价格数据
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
                        print(f"❌ Error in {filename}: {e}")

                doc = {
                    "Ticker": ticker,
                    "Prices": prices
                }

                await collection.insert_one(doc)
                print(f"✅ Inserted {ticker} ({len(prices)} records)")

# 3. 主函数
async def main():
    await import_tickers()
    await import_stock_prices()

if __name__ == "__main__":
    asyncio.run(main())
