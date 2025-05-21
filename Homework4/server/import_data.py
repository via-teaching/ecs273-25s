import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_pprabhu

tickers = [ 'XOM', 'CVX', 'HAL',
            'MMM', 'CAT', 'DAL',
            'MCD', 'NKE', 'KO',
            'JNJ', 'PFE', 'UNH',
            'JPM', 'GS', 'BAC',
            'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data')

# Import list of tickers to mongodb
async def import_tickers_to_mongodb():
    # Insert the tickers into the collection
    stock_name_collection = db.get_collection("stock_list")

    await stock_name_collection.insert_one({
        "tickers": tickers
    })
    print("Tickers inserted into MongoDB")

# Import stock data to mongodb. Using array of records(objects) approach, where each record contains the date and corresponding values.
async def import_stock_data():
    # Get reference to the stock data collection in MongoDB
    stock_collection = db.get_collection("stock_data")
    
    for ticker in tickers:    
        try:
            file_path = os.path.join(DATA_PATH, 'stockdata', f"{ticker}.csv")
            if not os.path.exists(file_path):
                print(f"Error #1 in import_data. {ticker} not found")
                continue
                
            df = pd.read_csv(file_path)
            
            stock_series = []
            for _, row in df.iterrows():
                stock_series.append({
                    "date": row["Date"],
                    "Open": float(row["Open"]),
                    "High": float(row["High"]),
                    "Low": float(row["Low"]),
                    "Close": float(row["Close"])
                })
            
            await stock_collection.insert_one({
                "name": ticker,
                "stock_series": stock_series
            })
            print(f"Stock data for {ticker} imported in mongoDB")
            
        except Exception as e:
            print(f"Error #2 in import_data. Error for {ticker}: {e}")

# Import news articles to mongodb. All news articles are stored in a single collection, with each article having a unique ID.
async def import_news_data():
    # Get reference to the news collection in MongoDB. Storing all news articles in a single collection
    news_collection = db.get_collection("stock_news")
    await news_collection.create_index("Stock")
    
    for ticker in tickers:
        news_dir = os.path.join(DATA_PATH, 'stocknews', ticker)
        if not os.path.exists(news_dir):
            print(f"Error #3 in import_data. {ticker} not found")
            continue
        
        news_files = [f for f in os.listdir(news_dir) if f.endswith('.txt')]
        
        for file_name in news_files:
            article_id = f"{ticker}-{file_name.replace('.txt', '')}"

            if await news_collection.count_documents({"_id": article_id}) > 0:
                continue
                
            try:
                # Open and read the news article file
                file_path = os.path.join(news_dir, file_name)
                with open(file_path, 'r', encoding='utf-8') as file:
                    lines = file.readlines()
                    
                    if len(lines) >= 3:
                        title = lines[0].strip()
                        date = lines[1].strip()
                        url = lines[2].strip()
                        content = ''.join(lines[3:])
                        
                        await news_collection.insert_one({
                            "_id": article_id,
                            "Stock": ticker,
                            "Title": title,
                            "Date": date,
                            "URL": url,
                            "content": content
                        })
                                                
            except Exception as e:
                print(f"Error #4 in import_data. {file_name} for {ticker}: {e}")
        print(f"News data for {ticker} imported in mongoDB")

# Import tsne data to mongodb
async def import_tsne_data():
    # Get reference to the tsne data collection in MongoDB
    tsne_collection = db.get_collection("tsne_data")
    
    try:
        file_path = os.path.join(DATA_PATH, 'tsne.csv')
        if not os.path.exists(file_path):
            print("Error #5 in import_data. tsne data not found")
            return
            
        df = pd.read_csv(file_path)
        
        tsne_data = []
        for _, row in df.iterrows():
            tsne_data.append({
                "stock": row["stock"],
                "x": float(row["x"]),
                "y": float(row["y"]),
                "sector": row["sector"]
            })
        
        await tsne_collection.insert_one({
            "data": tsne_data
        })
        
        print("t-SNE data imported in mongoDB")
        
    except Exception as e:
        print(f"Error #6 in import_data: {e}")

async def main():
    print("--- Starting data import ---")
    
    # Drop existing collections if they exist
    await db.stock_list.drop()
    await db.stock_data.drop()
    await db.stock_news.drop()
    await db.tsne_data.drop()
    
    await import_tickers_to_mongodb()
    await import_stock_data()
    await import_news_data()
    await import_tsne_data()
    
    print("--- Data import completed ---")

if __name__ == "__main__":
    asyncio.run(main())
