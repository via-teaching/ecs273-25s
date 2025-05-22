from fastapi import FastAPI, HTTPException
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from data_scheme import (
    StockListModel,
    StockModelV1,
    StockModelV2,
    StockNewsModel,
    tsneDataModel
)

# Connect to MongoDB
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_srisingh  # Replace with your MongoDB db name

app = FastAPI(
    title="Stock Tracking API",
    summary="API for stock prices, news, and t-SNE projection"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/stock_list", response_model=StockListModel)
async def get_stock_list():
    """
    Get list of available stock tickers
    """
    stock_list_collection = db.get_collection("stock_list")
    stock_list = await stock_list_collection.find_one()
    return stock_list


from fastapi import HTTPException

@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str) -> StockModelV2:
    collection = db.stock_v2
    data = await collection.find_one({"name": stock_name})
    
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    return data


from typing import List

@app.get("/stocknews/", response_model=List[StockNewsModel])
async def get_stock_news(stock_name: str):
    news_collection = db.get_collection("stock_news")
    cursor = news_collection.find({"Stock": stock_name})
    news = await cursor.to_list(length=1000)
    return news

@app.get("/tsne/all", response_model=List[tsneDataModel])
async def get_all_tsne_data():
    tsne_collection = db.get_collection("tsne")
    tsne_data_list = await tsne_collection.find().to_list(length=100)

    if not tsne_data_list:
        raise HTTPException(status_code=404, detail="No t-SNE data found")

    return tsne_data_list