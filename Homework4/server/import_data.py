import os
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient 
import asyncio

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")

'''
    stock_sahildadhwal (datbase)
      - stock_list (collection)
         - 1 document w a list of the tickers
'''    
db = client.stock_sahildadhwal

stock_name_collection = db.get_collection("stock_list")
stock_data_collection = db.get_collection("stock_data")
stock_news_collection = db.get_collection("stock_news")
tsne_collection = db.get_collection("tsne_data")


# tickers = [ 'XOM', 'CVX', 'HAL',
#             'MMM', 'CAT', 'DAL',
#             'MCD', 'NKE', 'KO',
#             'JNJ', 'PFE', 'UNH',
#             'JPM', 'GS', 'BAC',
#             'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META']

tickers = [ 
  'XOM', 'CVX', 'HAL',
  'MMM', 'CAT', 'DAL',
  'MCD', 'NKE', 'KO',
  'JNJ', 'PFE', 'UNH',
  'JPM', 'BAC', 'GS',
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'
]

async def import_tickers_to_mongodb():
    # need to clear the collection first otherwise it will make duplicates 
    # or i can first check if tickers array alr exist, but thats too much work for this, so i will clear the whole collection (probly not good practice tho)
    await stock_name_collection.delete_many({}) # (need to first have documents written before running delete, otherwise wrror)
    
    # Insert the tickers into the collection
    await stock_name_collection.insert_one({
        "tickers": tickers
    })

async def import_stockdata_to_mongodb():
    # Homework4/server/data/stockdata
    await stock_data_collection.delete_many({})
    
    for ticker in tickers:
        curr_file = f"Homework4/server/data/stockdata/{ticker}.csv"

        df = pd.read_csv(curr_file) # used llm to help read_csv (didnt know python/pandas syntax)
    
        date = []
        open = []
        high = []
        low = []
        close = []
        for index, row in df.iterrows():
            # im not goung to handle error/bad inputs bc i know the data i am feeding it, but otherwise i would
            curr_row = row.to_dict()
            curr_row["ticker"] = ticker
            # print(curr_row) # {'Date': '2025-04-09 00:00:00-04:00', 'Open': 509.2699890136719, 'High': 587.8900146484375, 'Low': 502.1099853515625, 'Close': 585.77001953125, 'Volume': 39216600, 'ticker': 'META'}
            
            '''
                name: str
                date: list[str]
                Open: list[float]
                High: list[float]
                Low: list[float]
                Close: list[float]
            '''
            date.append(curr_row["Date"])
            open.append(curr_row["Open"])
            high.append(curr_row["High"])
            low.append(curr_row["Low"])
            close.append(curr_row["Close"])



            # Insert the tickers into the collection
            # await stock_data_collection.insert_one(curr_row)
        
        doc = {
            "name": ticker,
            "date" : date,
            "Open" : open,
            "High" : high,
            "Low" : low,
            "Close" : close
        }
        await stock_data_collection.insert_one(doc)

async def import_stocknews_to_mongodb():
    # Homework4/server/data/stockdata
    await stock_news_collection.delete_many({})
    
    for ticker in tickers:
        news = []
        curr_folder = f"Homework4/server/data/stocknews/{ticker}"
        # List all files in the folder (using llm to help traverse file io )
        filenames = os.listdir(curr_folder)

        for article in filenames:
            article_no_extention = article.replace(".txt", "")
            #date, time, title
            date, time, title= article_no_extention.split("_", 2)  
            
            year = date[0:4]
            month = date[4:6]
            day = date[6:8]
            # print(time)
            hour = time[0:2]
            minute = time[2:4]
                        
            
            date = year+ "-" + month + "-" + day
            time = hour + ":" + minute + ":00" 


            curr_article = f"{curr_folder}/{article}"
        
            
            with open(curr_article, 'r', encoding='utf-8') as file:
                content = file.read()
                # print(content)
            
                stocknewsmodel = {
                    "Stock" : ticker,
                    "Title" : title, 
                    "Date" : date+ " " +time,
                    "content" : content
                }

                news.append(stocknewsmodel)
            
                
            '''
                class StockNewsModel(BaseModel):
                    _id: PyObjectId
                    Stock: str
                    Title: str
                    Date: str  
                    content: str
                    
                class StockNewsModelList(BaseModel):
                    Stock: str
                    News: list[StockNewsModel]
            '''



            # Insert the tickers into the collection
            # await stock_data_collection.insert_one(curr_row)
        
        doc = {
            "Stock" : ticker,
            "News" : news
        }
        await stock_news_collection.insert_one(doc)


async def import_tsne_to_mongodb():
    # Homework4/server/data/stockdata
    await tsne_collection.delete_many({})
    
    curr_file = "Homework4/server/data/tsne.csv"
    
    df = pd.read_csv(curr_file) # used llm to help read_csv (didnt know python/pandas syntax)

    for index, row in df.iterrows():
        # im not goung to handle error/bad inputs bc i know the data i am feeding it, but otherwise i would
        curr_row = row.to_dict()
    
        '''
            _id: PyObjectId
            Stock: str
            x: float
            y: float
        '''
    
        doc = {
            "Stock": curr_row["ticker"],
            "x": curr_row["dim1"],
            "y": curr_row["dim2"]
        }
        await tsne_collection.insert_one(doc)

async def run_awaits():
    await import_tickers_to_mongodb()
    await import_stockdata_to_mongodb()
    await import_stocknews_to_mongodb()
    await import_tsne_to_mongodb()

if __name__ == "__main__":
    # asyncio.run(import_tickers_to_mongodb())
    asyncio.run(run_awaits())
    # RuntimeError: Event loop is closed, this is happening bc we do asyncio run twice not once (used llm to help debug this/help w syntax)
    # asyncio.run(import_stockdata_to_mongodb())
