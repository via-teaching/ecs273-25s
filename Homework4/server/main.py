from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from typing import List
from pydantic import BaseModel

from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime

from data_scheme import (
    StockListModel,
    StockModelV2,
    StockNewsModel,
    tsneDataModel
)

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_YT  # rename to stock_[your_abbr]

# FastAPI app setup\
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
    """
    Get the list of all available stock tickers.
    """
    coll = db.get_collection("stock_list")
    doc = await coll.find_one({}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No stock list found")
    return StockListModel(**doc)



# …

@app.get("/stocknews/", response_model=List[StockNewsModel])
async def get_stock_news(stock_name: str = "XOM") -> List[StockNewsModel]:
    cursor = (
      db.news
        .find({"symbol": stock_name})
        .sort("publishedAt", 1)
    )
    docs = await cursor.to_list(length=100)
    if not docs:
        raise HTTPException(404, f"No news for {stock_name}")

    out: List[StockNewsModel] = []
    for doc in docs:
        raw_dt = doc.get("publishedAt")
        iso    = raw_dt.isoformat() if isinstance(raw_dt, datetime) else raw_dt

        # build a dict with exactly the fields your Pydantic model expects:
        out.append(StockNewsModel(
          _id     = doc["_id"],
          Stock   = stock_name,
          Title   = doc.get("title",""),
          Date    = iso,      # still a string here
          content = doc.get("content",""),
        ))

    return out

@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str) -> StockModelV2:
    coll = db.get_collection("prices_v2")
    # Remove {"_id": 0} to include the MongoDB _id field
    raw = await coll.find_one({"symbol": stock_name})  
    if not raw:
        raise HTTPException(404, f"No data for {stock_name}")

    # Use lowercase keys to match StockModelUnit
    aliased = []
    for r in raw["records"]:
        aliased.append({
            "date":  r["date"],   # lowercase
            "open":  r["open"],
            "high":  r["high"],
            "low":   r["low"],
            "close": r["close"],
        })

    return StockModelV2(
        _id=raw["_id"],  # Include _id (auto-converted to string via PyObjectId)
        name=raw["symbol"],
        stock_series=aliased
    )

@app.get("/tsne", response_model=List[tsneDataModel])
async def get_all_tsne() -> List[tsneDataModel]:
    """
    Get the t-SNE projection data for *all* stocks.
    """
    # project only the fields we need
    raw_docs = await db.tsne_data.find(
        {},
        {"_id": 1, "ticker": 1, "TSNE1": 1, "TSNE2": 1}
    ).to_list(length=None)

    # remap to match your tsneDataModel fields
    return [
        {
            "_id": doc["_id"],
            "Stock": doc["ticker"],
            "x":      doc["TSNE1"],
            "y":      doc["TSNE2"]
        }
        for doc in raw_docs
    ]


@app.get("/tsne/{stock_name}", response_model=tsneDataModel)
async def get_tsne(stock_name: str) -> tsneDataModel:
    """
    Get the t-SNE projection data for a specific stock.
    """
    doc = await db.tsne_data.find_one(
        {"ticker": stock_name},
        {"_id": 1, "ticker": 1, "TSNE1": 1, "TSNE2": 1}
    )
    if not doc:
        raise HTTPException(status_code=404,
                            detail=f"t-SNE data not found for {stock_name}")

    return {
        "_id":   doc["_id"],
        "Stock": doc["ticker"],
        "x":     doc["TSNE1"],
        "y":     doc["TSNE2"]
    }
