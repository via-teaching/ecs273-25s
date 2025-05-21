from fastapi import FastAPI
from fastapi import HTTPException
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware
from typing import List
from bson import ObjectId


from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, TSNEPoint, NewsArticle

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["stock_lyt"] # please replace the database name with stock_[your name] to avoid collision at TA's side
            
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


@app.get("/stock_list", response_model=List[str])
async def get_stock_list():
    cursor = db.stockdata.find({}, {"Stock": 1, "_id": 0})
    tickers = [doc["Stock"] async for doc in cursor]
    return tickers


@app.get("/stock/{stock_name}", response_model=StockModelV1)
async def get_stock(stock_name: str):
    result = await db.stockdata.find_one({"Stock": stock_name.upper()})
    if not result:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    
    result["_id"] = str(result["_id"])  
    
    return result

@app.get("/stocknews/{stock_name}", response_model=List[NewsArticle])
async def get_stock_news(stock_name: str):
    cursor = db.stocknews.find({"Stock": stock_name.upper()})
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    if not results:
        raise HTTPException(status_code=404, detail="No news found for this stock")
    return results

@app.get("/tsne", response_model=List[TSNEPoint])
async def get_tsne():
    cursor = db.tsne.find({})
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results
