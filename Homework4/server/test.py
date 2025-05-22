import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_news():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.stock_ccc   # ← 請改成你的資料庫名稱，例如 stock_chichun

    cursor = db.stocknews.find({"stock": "AAPL"})
    result = await cursor.to_list()
    
    if not result:
        print("❌ 沒有找到 GOOGL 的新聞")
    else:
        print(f"✅ 找到 {len(result)} 筆 GOOGL 新聞（顯示前 5 筆）：")
        for item in result:
            print(f"- {item['title']} ({item['date']})")

if __name__ == "__main__":
    asyncio.run(check_news())
