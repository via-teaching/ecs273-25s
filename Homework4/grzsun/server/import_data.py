import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_gsun

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


tsne_collection = db.get_collection("tsne_data")
async def import_tsne_to_mongodb():
    # Insert tsne data into the collection
    data = []
    with open("./data/tsne.csv", encoding='utf-8') as file:
        data = file.readlines()

    data_json = []
    for d in data[1:]:
        d = d.rstrip('\n').split(',')
        tmp = {
            "label": d[0],
            "x":float(d[1]),
            "y":float(d[2])
        }

        data_json.append(tmp)
    await tsne_collection.insert_many(data_json)

stock_news_collection = db.get_collection("stocknews_data")
async def import_stocknews_to_mongodb():
    # Insert stock news data into the collection
    
    data = []

    files = os.listdir('./data/stocknews')
    base_path = './data/stocknews'
    for f in files:
        news_docs = os.listdir(base_path + '/' + f)
        for docs in news_docs:
            doc_path = base_path + '/' + f + '/' + docs
            with open(doc_path, encoding='utf-8') as text_file:
                text = text_file.readlines()
                tmp = {
                    "Stock": f,
                    "Title": text[0].strip("\n"),
                    "Date": text[1].strip("\n"),
                    "content":text[3],
                }
                data.append(tmp)
    await stock_news_collection.insert_many(data)
    
stock_data_collection = db.get_collection("stockdata_data")
async def import_stockdata_to_mongodb():
    # Insert stock news data into the collection
    data = []

    files = os.listdir('./data/stockdata')
    base_path = './data/stockdata'
    for f in files:
        
        date_data = []
        open_data = []
        high_data = []
        low_data = []
        close_data = []
        
        stock_data_path = base_path + '/' + f
        with open(stock_data_path, encoding='utf-8') as doc:
            text = doc.readlines()
            for info in text[1:]:
                info = info.rstrip("\n").split(",")
                date_data.append(info[0])
                open_data.append(float(info[1]))
                high_data.append(float(info[2]))
                low_data.append(float(info[3]))
                close_data.append(float(info[4]))
        
        tmp = {
            'name': f.split('.')[0],
            'date':date_data,
            'Open': open_data,
            'High': high_data,
            'Low': low_data,
            'Close': close_data,
        }
        data.append(tmp)
    await stock_data_collection.insert_many(data)

async def main():
    await import_tickers_to_mongodb()
    await import_tsne_to_mongodb()
    await import_stocknews_to_mongodb()
    await import_stockdata_to_mongodb()

if __name__ == "__main__":
    asyncio.run(main())

