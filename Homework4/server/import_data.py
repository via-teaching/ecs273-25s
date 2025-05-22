import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_jas

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

stock_data_collection = db.get_collection("stockdata")
async def import_tickers_to_mongodb_2():
	filepath = './data/stockdata/'
	for ticker in tickers:
		df = pd.read_csv(filepath + ticker + '.csv')
		listOfRecs = df.to_dict(orient='records')
		await stock_data_collection.insert_one({
			"name": ticker,
			"stock_series": listOfRecs
		})

stock_news_collection = db.get_collection("stocknews")
async def import_tickers_to_mongodb_3():
    with open('./data/articles.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    for ticker in tickers:
          
          await stock_news_collection.insert_one({
            "Stock": ticker,
			"News": data[ticker]
		})
          
tsne_collection = db.get_collection("tsne")
async def import_tickers_to_mongodb_4():
    df = pd.read_csv('./data/tsne.csv')
    
    listOfRecs = df.to_dict(orient='records')
    await tsne_collection.insert_one({
        "Values": listOfRecs
		})
    
if __name__ == "__main__":
    asyncio.run(import_tickers_to_mongodb())
    asyncio.run(import_tickers_to_mongodb_2())
    asyncio.run(import_tickers_to_mongodb_3())
    asyncio.run(import_tickers_to_mongodb_4())
