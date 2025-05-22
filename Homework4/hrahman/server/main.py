from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

from data_scheme import StockListModel, StockModelV2, StockNewsModel, tsneDataModel, StockModelUnit

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_hrahman

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
    docs = await collection.find({"name": stock_name}).to_list(length=None)
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
async def get_stock_news(stock_name: str = 'XOM'):
    """
    Get all news articles for a given stock, sorted by most recent first.
    """
    news_collection = db.get_collection("news_data")
    cursor = news_collection.find({ "Stock": stock_name }).sort("Date", -1)
    results = await cursor.to_list(length=None)
    return results

@app.get("/tsne/", response_model=list[tsneDataModel])
async def get_tsne():
    """
    Get t-SNE projection data for all stocks.
    """
    tsne_collection = db.get_collection("tsne_data")
    results = await tsne_collection.find({}).to_list(length=None)
    for r in results:
        r["_id"] = str(r["_id"])
    return results