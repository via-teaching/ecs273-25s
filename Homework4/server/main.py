from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from fastapi.responses import JSONResponse

from data_scheme import (
    StockListModel, StockModelV1, StockModelV2, 
    StockNewsModel, tsneDataModel
)

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_qiatan

app = FastAPI(
    title="Stock tracking API",
    summary="An application tracking stock prices and respective news"
)

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
    if not stock_list:
        return {"_id": str(ObjectId()), "tickers": []}
    stock_list["_id"] = str(stock_list["_id"])
    return stock_list

@app.get("/news/", response_model=list[StockNewsModel])
async def get_stock_news(stock_name: str = 'XOM'):
    news_collection = db.get_collection("news")
    cursor = news_collection.find({"Stock": stock_name})
    results = []
    async for doc in cursor:
        results.append(doc)
    return results

@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str):
    stock_collection = db.get_collection("stock_prices")
    doc = await stock_collection.find_one({"Ticker": stock_name})
    if doc:
        cleaned_prices = [
            {
                "date": item.get("Date", ""), 
                "Open": item.get("Open"),
                "High": item.get("High"),
                "Low": item.get("Low"),
                "Close": item.get("Close")
            }
            for item in doc["Prices"]
        ]
        return {
            "_id": str(doc["_id"]),
            "name": doc["Ticker"],
            "stock_series": cleaned_prices
        }
    return {
        "_id": "",
        "name": stock_name,
        "stock_series": []
    }

@app.get("/tsne/")
async def get_tsne():
    tsne_collection = db.get_collection("tsne")
    cursor = tsne_collection.find({})
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  
        results.append(doc)
    return JSONResponse(content=results)