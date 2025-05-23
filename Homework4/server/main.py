import traceback
from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import ValidationError
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, StockNewsModelList, tsneDataModel

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_vibha # please replace the database name with stock_[your name] to avoid collision at TA's side
            
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
async def get_stock_news(stock_name: str = 'XOM') -> StockNewsModelList:
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    news_collection = db.get_collection("stock_news")
    result = await news_collection.find_one({"Stock": stock_name})

    if not result:
        raise HTTPException(status_code=404, detail=f"No news found for stock: {stock_name}")

    # cleaned_news = []
    # for item in result["News"]:
    #     if "Title" not in item or "Date" not in item or "content" not in item:
    #         print("Skipping malformed item:", item)
    #         continue

    #     cleaned_item = item.copy()
    #     if "_id" in cleaned_item:
    #         cleaned_item["_id"] = str(cleaned_item["_id"])
    #     cleaned_news.append(cleaned_item)

    # cleaned_result = {
    #     "Stock": result["Stock"],
    #     "News": cleaned_news
    # }

    try:
        return result
    except ValidationError as e:
        print("Validation error:", e.json())
        print(repr(e.errors()[0]['type']))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Response validation failed")

@app.get("/stock/{stock_name}", 
        response_model=StockModelV2
    )
async def get_stock(stock_name: str):
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_data_collection = db.get_collection("stock_data")
    
    # Try to find the document for this stock
    document = await stock_data_collection.find_one({"name": stock_name})
    
    if not document:
        raise HTTPException(status_code=404, detail=f"Stock '{stock_name}' not found")

    return document

@app.get("/tsne",
        response_model=list[tsneDataModel]
    )
async def get_tsne() -> list[tsneDataModel]:
    """
    Get the t-SNE data for a specific stock
    """
    stock_tsne_data_collection = db.get_collection("stock_tsne_data")
    result = await stock_tsne_data_collection.find().to_list(length=None)
    if not result:
        raise HTTPException(status_code=404, detail=f"No t-SNE data found for stock: {stock_name}")
    return result