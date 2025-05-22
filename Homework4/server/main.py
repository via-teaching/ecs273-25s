from fastapi import FastAPI, HTTPException
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware

from .data_scheme import  StockListItem, StockRecord, StockNewsModel
from typing import List
import os

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_manami # please replace the database name with stock_[your name] to avoid collision at TA's side
            
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

@app.get("/")
def root():
    return {"message": "FastAPI is running"}


@app.get("/api/stocks", response_model=List[StockListItem])
async def get_stock_list():
    cursor = db.stocks.find({}, {"_id": 0, "ticker": 1, "sector": 1, "company": 1})
    return [doc async for doc in cursor]

@app.get("/api/stocks/{ticker}/prices", response_model=StockRecord)
async def get_stock_prices(ticker: str):
    doc = await db.stocks.find_one({"ticker": ticker.upper()})
    if not doc:
        raise HTTPException(status_code=404, detail="Stock not found")
    return doc



# @app.get("/stock_list", 
#          response_model=StockListModel
#     )
# async def get_stock_list():
#     """
#     Get the list of stocks from the database
#     """
#     stock_name_collection = db.get_collection("stock_list")
#     stock_list = await stock_name_collection.find_one()
#     return stock_list

# @app.get("/stocknews/", 
#         response_model=StockNewsModel
#     )
# async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModel:
#     """
#     Get the list of news for a specific stock from the database
#     The news is sorted by date in ascending order
#     """
#     return [] # replace with your code to get the news from the database

# @app.get("/stock/{stock_name}", 
#         response_model=StockModelV2
#     )
# async def get_stock() -> StockModelV2:
#     """
#     Get the stock data for a specific stock
#     Parameters:
#     - stock_name: The name of the stock
#     """
#     return [] # replace with your code to get the news from the database

# @app.get("/tsne/",
#         response_model=tsneDataModel
#     )
# async def get_tsne(stock_name: str = 'XOM') -> tsneDataModel:
#     """
#     Get the t-SNE data for a specific stock
#     """
#     return [] # replace with your code to get the news from the database
