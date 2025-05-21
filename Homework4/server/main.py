from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient


from fastapi.middleware.cors import CORSMiddleware
from pymongo import ASCENDING
from datetime import datetime
import logging

from data_scheme import StockListModel, StockModelV2, StockNewsModel, tsneDataModel

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient(
    "mongodb+srv://studentUser:123@cluster0.58yt40u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
db = client.stock_md # please replace the database name with stock_[your name] to avoid collision at TA's side

app = FastAPI(
    title="Stock tracking API",
    summary="An application tracking stock prices and respective news"
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
    Get the list of stocks from the database
    """
    stock_name_collection = db.get_collection("stock_list")
    stock_list = await stock_name_collection.find_one()
    if not stock_list:
        return {"_id": "", "tickers": []}
    # convert ObjectId to string
    stock_list["_id"] = str(stock_list["_id"])
    return stock_list

def convert_mongo_doc(doc: dict) -> dict:
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "Date" in doc and isinstance(doc["Date"], datetime):
        doc["Date"] = doc["Date"].isoformat()
    return doc

@app.get("/stocknews/")


async def get_stock_news(stock_name: str = "XOM"):
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    try:
        stock_news_collection = db.get_collection("news")
        cursor = stock_news_collection.find({"Stock": stock_name}).sort("Date", ASCENDING)
        news_list = await cursor.to_list(length=None)
        cleaned_news = [convert_mongo_doc(doc) for doc in news_list]
        # Return a dict with Stock and news (list of articles)
        return {"Stock": stock_name, "news": cleaned_news}
    except Exception as e:
        logging.error(f"Error fetching stock news for {stock_name}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/stock/{stock_name}", response_model=StockModelV2)


async def get_stock(stock_name: str) -> StockModelV2:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_price_collection = db.get_collection("stock_prices")
    stock_data = await stock_price_collection.find_one({"name": stock_name})
    if not stock_data:
        return {"_id": "", "name": stock_name, "stock_series": []}
    stock_data["_id"] = str(stock_data["_id"])
    return {
        "_id": stock_data["_id"],
        "name": stock_data["name"],
        "stock_series": stock_data["stock_series"],
    }


@app.get("/tsne/", response_model=list[tsneDataModel])


async def get_tsne(stock_name: str = None):
    """
    Get the t-SNE data for a specific stock
    """
    tsne_collection = db.get_collection("tsne_data")
    if stock_name:
        cursor = tsne_collection.find({"Stock": stock_name})
    else:
        cursor = tsne_collection.find()
    tsne_data_list = await cursor.to_list(length=None)

    # convert ObjectId to string
    for doc in tsne_data_list:
        doc["_id"] = str(doc["_id"])

    # print fetched data for debugging
    print(f"Fetched {len(tsne_data_list)} TSNE points")
    # first few docs for quick check
    print(tsne_data_list[:5])

    return tsne_data_list





