from fastapi import FastAPI, HTTPException
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel, APIResponse, ErrorResponse, NewsItem

# MongoDB connection (localhost, default port)
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.stock_ccc 
            
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
         response_model=List[str]
    )
async def get_stock_list():
    """
    Get the list of stocks from the database
    """
    try:
        stock_data_collection = db.get_collection("stockdata")
        
        # Query all stock documents and get unique stock names
        cursor = stock_data_collection.find({}, {"name": 1, "_id": 0})
        tickers = [doc["name"] async for doc in cursor if "name" in doc and not doc["name"].endswith("_v1")]
        
        # Remove duplicates and sort
        unique_tickers = sorted(list(set(tickers)))
        
        if not unique_tickers:
            raise HTTPException(status_code=404, detail="No stock data found")
        
        return unique_tickers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stocknews/", 
         response_model=List[StockNewsModel]
    )
async def get_stock_news(stock_name: str = 'XOM') -> List[StockNewsModel]:  # ← 修正這裡
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    try:
        stock_news_collection = db.get_collection("stocknews")
        
        # Query news for specific stock from SINGLE collection
        cursor = stock_news_collection.find(
            {"Stock": stock_name}
        ).sort("Date", 1)  # 1 for ascending order
        
        news_list = await cursor.to_list(length=None)
        
        if not news_list:
            raise HTTPException(status_code=404, detail=f"No news found for stock: {stock_name}")
        
        return news_list
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/stock/{stock_name}", 
         response_model=StockModelV2
    )
async def get_stock(stock_name: str) -> StockModelV2:
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    try:
        stock_data_collection = db.get_collection("stockdata")
        
        # 簡化查詢條件
        stock_data = await stock_data_collection.find_one(
            {"name": stock_name}
        )
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock data not found for: {stock_name}")
        
        return stock_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/tsne/",
         response_model=List[tsneDataModel]
    )
async def get_tsne() -> List[tsneDataModel]:
    """
    Get all t-SNE data for visualization
    """
    try:
        cursor = db.tsne.find({})
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"]) 

            results.append(doc)

        if not results:
            raise HTTPException(status_code=404, detail="No t-SNE data found")

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/news/{ticker}", response_model=List[NewsItem])
async def get_news(ticker: str):
    try:
        cursor = db.stocknews.find({"stock": ticker})
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)

        if not results:
            raise HTTPException(status_code=404, detail=f"No news found for {ticker}")
        
        return results

    except Exception as e:
        print("❌ Error while fetching news:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/health", response_model=dict)
async def health_check():
    """
    Health check endpoint
    """
    try:
        await db.list_collection_names()
        return {
            "status": "healthy", 
            "database": "connected",
            "database_name": db.name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting FastAPI server...")
    print("📊 Database:", db.name)
    print("🌐 API docs will be available at: http://localhost:8000/docs")
    
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )