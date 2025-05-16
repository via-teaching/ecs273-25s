from fastapi import FastAPI, HTTPException
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV2, StockNewsModel, StockNewsListModel, tsneDataModel

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_pprabhu 
            
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

    if not stock_list:
        raise HTTPException(status_code=404, detail="Stock list not found. Retry database initialization.")
    
    return stock_list

@app.get("/stocknews/", 
        response_model=StockNewsListModel
    )
async def get_stock_news(stock_name: str = 'XOM') -> StockNewsListModel:
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    news_collection = db.get_collection("stock_news")
    pointer = news_collection.find({"Stock": stock_name})
    
    news_articles = await pointer.to_list(length=100)
    news_articles.sort(key=lambda x: x["Date"])
    
    return StockNewsListModel(articles=news_articles)

@app.get("/stock/{stock_name}", 
        response_model=StockModelV2
    )
async def get_stock(stock_name: str) -> StockModelV2:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_collection = db.get_collection("stock_data")
    stock_data = await stock_collection.find_one({"name": stock_name})
    
    if not stock_data:
        raise HTTPException(status_code=404, detail=f"Stock data for {stock_name} not found. Retry database initialization.")
    
    return stock_data

@app.get("/tsne/",
        response_model=tsneDataModel
    )
async def get_tsne(stock_name: str = 'XOM') -> tsneDataModel:
    """
    Get the t-SNE data for a specific stock
    """
    tsne_collection = db.get_collection("tsne_data")
    tsne_data = await tsne_collection.find_one()
    
    if not tsne_data:
        raise HTTPException(status_code=404, detail="t-SNE data not found. Retry database initialization.")
    
    return tsne_data