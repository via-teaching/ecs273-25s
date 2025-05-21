from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, StockNewsModelList, tsneDataModel

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_qikai # please replace the database name with stock_[your name] to avoid collision at TA's side
            
app = FastAPI(
    title="Stock tracking API",
    summary="An aplication tracking stock prices and respective news"
)

# Enables CORS to allow frontend apps to make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stock_list", 
         response_model=StockListModel
    )
async def get_stock_list():
    """
    Get the list of stocks from the database
    """
    stock_name_collection = db.get_collection("stock_list")
    stock_list = await stock_name_collection.find_one()
    return stock_list

@app.get("/stocknews/", 
        response_model=StockNewsModelList
    )
async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModelList:
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    stock_news_collection = db.get_collection("stock_news")
    find = stock_news_collection.find({"stock": stock_name}).sort("title",1)
    news_list = []
    async for newsdata in find:
        news = StockNewsModel(
            id=str(newsdata["_id"]),
            stock=newsdata["stock"],
            title=newsdata["title"],
            content=newsdata["content"]
        )
        news_list.append(news)
    return StockNewsModelList(Stock=stock_name, News=news_list) # replace with your code to get the news from the database

@app.get("/stock/{stock_name}", 
        response_model=StockModelV1
    )
async def get_stock(stock_name: str = 'XOM') -> StockModelV1:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_data_collection = db.get_collection("stock_data")
    stockdata = await stock_data_collection.find_one({"ticker": stock_name})
    if not stockdata:
        return {"_id": "000000000000000000000000", 
                "Name": stock_name, 
                "Date": [], 
                "Open": [], 
                "High": [], 
                "Low": [], 
                "Close": []}
    return {
        "_id": str(stockdata["_id"]),
        "Name": stock_name,
        "Date": stockdata["date"],
        "Open": stockdata["open"],
        "High": stockdata["high"],
        "Low": stockdata["low"],
        "Close": stockdata["close"]
    } # replace with your code to get the news from the database

@app.get("/tsne/",
        response_model=tsneDataModel
    )
async def get_tsne(stock_name: str = 'XOM') -> tsneDataModel:
    """
    Get the t-SNE data for a specific stock
    """
    tsne_collection = db.get_collection("tsne_data")
    tsnedata = await tsne_collection.find_one({"ticker": stock_name})

    if not tsnedata:
        return {
            "_id": "000000000000000000000000",
            "Stock": stock_name,
            "Category": "none",
            "x": 0.0,
            "y": 0.0,
        }

    return {
        "_id": str(tsnedata["_id"]),
        "Stock": tsnedata["ticker"],
        "Category": tsnedata["category"],
        "x": tsnedata["x"],
        "y": tsnedata["y"]
    } # replace with your code to get the news from the database
