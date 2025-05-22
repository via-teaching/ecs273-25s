from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, StockNewsModelList, tsneDataList

# MongoDB connection (replace with your personal DB name to avoid TA conflict)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_sd

# FastAPI initialization
app = FastAPI(
    title="Stock Tracking API",
    summary="An application tracking stock prices and respective news"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
#         ROUTES
# -----------------------------

@app.get("/stock_list", response_model=StockListModel)
async def get_stock_list():
    """
    Get the list of stocks from the database
    """
    stock_name_collection = db.get_collection("stock_list")
    stock_list = await stock_name_collection.find_one()
    return stock_list


@app.get("/stocknews/", response_model=StockNewsModelList)
async def get_stock_news(stock_name: str = 'XOM'):
    """
    Get the list of news for a specific stock from the database.
    The news is sorted by date in ascending order.
    """
    news_collection = db.get_collection("news_data")
    cursor = news_collection.find({"Stock": stock_name}).sort("Date", 1)
    news_list = await cursor.to_list(length=None)
    return {"Stock": stock_name, "News": news_list}


@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str):
    """
    Get the stock data for a specific stock
    """
    stock_collection = db.get_collection("stock_data")
    stock_data = await stock_collection.find_one({"ticker": stock_name})
    return stock_data
    # response_model=StockModelV2


@app.get("/tsne/", response_model=tsneDataList)
async def get_tsne():
    """
    Get all t-SNE data points for visualization
    """
    tsne_collection = db.get_collection("tsne_data")
    cursor = tsne_collection.find()
    tsne_list = await cursor.to_list(length=None)
    return {"ZData": tsne_list}
