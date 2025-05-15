from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, StockNewsModelList, tsneDataList

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_garchan # please replace the database name with stock_[your name] to avoid collision at TA's side
            
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

@app.get("/stock_list", 
         response_model=StockListModel
    )
async def get_stock_list():
    """
    Get the list of stocks from the database
    """
    stock_name_collection = db.get_collection("stock_list")
    stock_list = await stock_name_collection.find_one()
    return stock_list

@app.get("/stocknews/", 
        response_model=StockNewsModelList
    )
async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModelList:
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    news_collection = db.get_collection("stock_news")
    news_cursor = news_collection.find({"Stock": stock_name}).sort("Date")
    news_list = await news_cursor.to_list()

    return {
        "Stock": stock_name,
        "News": news_list
    }

@app.get("/stock/{stock_name}", 
        response_model=StockModelV2
    )
async def get_stock(stock_name: str = 'XOM') -> StockModelV2:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_price_collection = db.get_collection("stock_prices")
    price_list = await stock_price_collection.find_one({"name": stock_name})
    return price_list

@app.get("/tsne/",
        response_model=tsneDataList
    )
async def get_tsne() -> tsneDataList:
    """
    Get the t-SNE data for all stocks
    """
    tsne_collection = db.get_collection("tsne_data")
    tsne_cursor = tsne_collection.find()
    tsne_data = await tsne_cursor.to_list()
    return {"ZData": tsne_data}