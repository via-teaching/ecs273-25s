from fastapi import FastAPI, Query, HTTPException
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
import logging
from fastapi import HTTPException

from data_scheme import StockListModel, StockModelV2, StockNewsModel, tsneDataModel, StockModelUnit

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_vnsingh

app = FastAPI(
    title="Stock Tracking API",
    summary="Tracks stock Prices, News, and T-SNE projections"
)

# Enables CORS to allow frontend apps to make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/debug/")
async def debug():
    docs = await db.get_collection("news_data").find({}).to_list(1)
    return docs[0]

@app.get("/stock_list", response_model=StockListModel)
async def get_stock_list():
    """
    Get list of all tracked stock tickers.
    """
    stock_name_collection = db.get_collection("stock_list")
    result = await stock_name_collection.find_one()
    return result

@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str):
    """
    Get stock prices data
    """
    collection = db.get_collection("price_data")
    docs = await collection.find({"ticker": stock_name}).to_list(length=None)
    if not docs:
        raise HTTPException(status_code=404, detail=f"Stock '{stock_name}' not found")
    stock_series = [
        StockModelUnit(
            date=doc["Date"],
            Open=doc["Open"],
            High=doc["High"],
            Low=doc["Low"],
            Close=doc["Close"]
        ) for doc in docs]
    return { "name": stock_name, "stock_series": stock_series }

@app.get("/stocknews/", response_model=list[StockNewsModel])
async def fetch_stock_news_articles(stock_name: str = Query(..., description="Stock ticker symbol (e.g., AAPL, NVDA, TSLA)")):
    """
    Returns news articles for a given stock, sorted by most recent first.
    """
    news_collection = db.get_collection("news_data")
    cursor = news_collection.find({"Stock": stock_name}).sort("Date", -1)
    results = await cursor.to_list(length=None)
    return results

@app.get("/tsne/", response_model=list[tsneDataModel])
async def get_tsne():
    tsne_collection = db.get_collection("tsne_data")
    results = await tsne_collection.find({}).to_list(length=None)

    valid_data = []
    for doc in results:
        try:
            model = tsneDataModel(
                _id=str(doc["_id"]),
                Stock=doc["Stock"],
                x=float(doc["x"]),
                y=float(doc["y"]),
                sector=doc["sector"],
                color=doc["color"]
            )
            valid_data.append(model)
        except Exception as e:
            logging.warning(f"Skipping invalid document: {doc} — Error: {e}")

    if not valid_data:
        raise HTTPException(status_code=500, detail="No valid t-SNE data found.")

    return valid_data