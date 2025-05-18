from fastapi import FastAPI, HTTPException
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware

from data_scheme import (
    StockListModel,
    StockModelV1,
    StockModelV2,
    StockNewsModel,
    StockNewsModelList,
    tsneDataModel
)

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_gurjash

app = FastAPI(
    title="Stock tracking API",
    summary="An application tracking stock prices and respective news"
)

# Enable CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stock_list", response_model=StockListModel)
async def get_stock_list():
    stock_name_collection = db.get_collection("stock_list")
    stock_list = await stock_name_collection.find_one()
    if stock_list is None:
        raise HTTPException(status_code=404, detail="Stock list not found")
    return stock_list

@app.get("/stocknews/", response_model=StockNewsModelList)
async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModelList:
    stock_news_collection = db.get_collection("stock_news")
    cursor = stock_news_collection.find({"Stock": stock_name})
    news_docs = await cursor.to_list(length=100)
    if not news_docs:
        raise HTTPException(status_code=404, detail="No news found for this stock")

    return {
        "Stock": stock_name,
        "News": news_docs
    }

@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str):
    stock_data_collection = db.get_collection("stock_values")
    doc = await stock_data_collection.find_one({"name": stock_name})
    if not doc:
        raise HTTPException(status_code=404, detail="Stock not found")
    return doc

@app.get("/tsne/", response_model=tsneDataModel)
async def get_tsne(stock_name: str = 'XOM') -> tsneDataModel:
    tsne_collection = db.get_collection("tsne_data")
    doc = await tsne_collection.find_one({"Stock": stock_name})
    if not doc:
        raise HTTPException(status_code=404, detail="t-SNE data not found")
    return doc
