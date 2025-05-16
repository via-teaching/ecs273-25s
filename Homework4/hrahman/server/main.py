from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel
from bson import ObjectId

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


@app.get("/stocknews/", response_model=list[StockNewsModel])
async def get_stock_news(stock_name: str = 'XOM'):
    """
    Get all news articles for a given stock, sorted by most recent first.
    """
    news_collection = db.get_collection("news_data")
    cursor = news_collection.find({ "Stock": stock_name }).sort("Date", -1)
    results = await cursor.to_list(length=None)
    return results


@app.get("/stock/{stock_name}", response_model=StockModelV2)
async def get_stock(stock_name: str):
    """
    Get OHLC time series for a specific stock.
    """
    price_collection = db.get_collection("price_data")
    result = await price_collection.find_one({ "name": stock_name })
    return result


@app.get("/tsne/", response_model=list[tsneDataModel])
async def get_tsne():
    """
    Get t-SNE projection data for all stocks.
    """
    tsne_collection = db.get_collection("tsne_data")
    results = await tsne_collection.find({}).to_list(length=None)
    return results

# @app.get("/stock_list", response_model=StockListModel)
# async def get_stock_list():
#     """
#     Get the list of stocks from the database
#     """
#     stock_name_collection = db.get_collection("stock_list")
#     stock_list = await stock_name_collection.find_one()
#     return stock_list

# @app.get("/stocknews/", response_model=StockNewsModel)
# async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModel:
#     """
#     Get the list of news for a specific stock from the database
#     The news is sorted by date in ascending order
#     """
#     return [] # replace with your code to get the news from the database

# @app.get("/stock/{stock_name}", response_model=StockModelV2)
# async def get_stock() -> StockModelV2:
#     """
#     Get the stock data for a specific stock
#     Parameters:
#     - stock_name: The name of the stock
#     """
#     return [] # replace with your code to get the news from the database

# @app.get("/tsne/",response_model=tsneDataModel)
# async def get_tsne(stock_name: str = 'XOM') -> tsneDataModel:
#     """
#     Get the t-SNE data for a specific stock
#     """
#     return [] # replace with your code to get the news from the database