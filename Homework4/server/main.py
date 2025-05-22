from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel, StockNewsModelList, tsneModelList

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_jas # please replace the database name with stock_[your name] to avoid collision at TA's side
            
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

@app.get("/stocknews/{stock_name}", 
        response_model=StockNewsModelList
    )
async def get_stock_news(stock_name) -> StockNewsModelList:
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    stock_news_collection = db.get_collection("stocknews")
    stock_news = await stock_news_collection.find_one({"Stock": stock_name})
    return stock_news # replace with your code to get the news from the database

@app.get("/stock/{stock_name}", 
        response_model=StockModelV2
    )
async def get_stock(stock_name) -> StockModelV2:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """

    stock_data_collection = db.get_collection("stockdata")
    stock_data = await stock_data_collection.find_one({"name": stock_name})
    return stock_data # replace with your code to get the news from the database

@app.get("/tsne/",
        response_model=tsneModelList
    )
async def get_tsne(stock_name: str = 'XOM') -> tsneModelList:
    """
    Get the t-SNE data for a specific stock
    """
    tsne_collection = db.get_collection("tsne")
    tsne = await tsne_collection.find_one()
    return tsne # replace with your code to get the news from the database


if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, log_level="info")