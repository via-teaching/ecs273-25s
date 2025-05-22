import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel, StockNewsModelList


# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_kx

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

stock_news_collection = db.get_collection("stocknews")
async def import_stock_news_to_mongodb():
    news = []
    for ticker in tickers:
        try:
            directory = "./data/stocknews/" + ticker
            newsFiles = os.listdir(directory)
            for file in newsFiles:
                lines = open(directory + "/" + file)
                title = None
                date = None
                content = ""
                for i, line in enumerate(lines):
                    if i == 0:
                        title = line.strip()
                    elif i == 1:
                        date = line.strip()
                    else:
                        content += line.strip() + "\n"
                content = content.strip()
                news.append({"Stock": ticker, "Title": title, "Date": date, "content": content})
        except:
            pass
    await stock_news_collection.insert_many(news)
    
    
    
stock_collection = db.get_collection("stock")
async def import_stocks_to_mongodb():
    for ticker in tickers:
        stock_data = pd.read_csv("./data/stockdata/" + ticker + ".csv")
        dates = []
        opens = []
        highs = []
        lows = []
        closes = []
        for i in range(len(stock_data)):
            dates.append(stock_data.loc[i, "Date"].strip())
            opens.append(stock_data.loc[i, "Open"])
            highs.append(stock_data.loc[i, "High"])
            lows.append(stock_data.loc[i, "Low"])
            closes.append(stock_data.loc[i, "Close"])
            
        await stock_collection.insert_one({"name": ticker, "date": dates, "Open": opens, "High": highs, "Low": lows, "Close": closes})   
    
tsne_collection = db.get_collection("tsne")
async def import_tsne_to_mongodb():
    tsne_data = pd.read_csv("./data/tsne_data.csv")
    for i in range(len(tsne_data)):
        stock = tsne_data.loc[i, "Ticker"].strip()
        x = tsne_data.loc[i, "x"]
        y = tsne_data.loc[i, "y"]
        sector = tsne_data.loc[i, "Sector"].strip()
        await tsne_collection.insert_one({"Stock": stock, "x": x, "y": y, "Sector": sector})    


async def main():
    await import_tickers_to_mongodb()
    await import_stock_news_to_mongodb()
    await import_stocks_to_mongodb()
    await import_tsne_to_mongodb()
    
if __name__ == "__main__":
    asyncio.run(main())