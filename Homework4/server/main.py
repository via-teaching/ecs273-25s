from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel
from typing import List
# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_zlihuang
            
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
        response_model=List[StockNewsModel]
    )
async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModel:
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    stock_news_collection = db.get_collection("stock_news")
    # result = await stock_news_collection.find_one({"Stock": stock_name})
    cursor = stock_news_collection.find({"Stock": stock_name})
    result = await cursor.to_list(length=None)
    return result
    # return [] # replace with your code to get the news from the database

@app.get("/stock/{stock_name}", 
        response_model=StockModelV2
    )
async def get_stock(stock_name: str) -> StockModelV2:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_data_collection = db.get_collection("stock_data_v2")
    result = await stock_data_collection.find_one({"name": stock_name})
    return result
    # return [] # replace with your code to get the news from the database

@app.get("/tsne/",
        response_model=List[tsneDataModel]
    )
async def get_tsne() -> tsneDataModel:
    """
    Get the t-SNE data for the whole data
    """
    tsne_collection = db.get_collection("tsne_data")
    # result = await tsne_collection.find_one({"Stock": stock_name})
    cursor = tsne_collection.find({})
    result = await cursor.to_list() 
    return result
    # return [] # replace with your code to get the news from the database