from fastapi import FastAPI
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient

from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel

# MongoDB connection 
MONGO_URI = "mongodb+srv://iakahssay:ecs273@hw4.q7b31db.mongodb.net/?retryWrites=true&w=majority&appName=hw4"
client = AsyncIOMotorClient(MONGO_URI)
db = client["stock_Iman_K"] #Safer way to access it than "client.stock_Iman_K"

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

@app.get("/stock_news/" )
async def get_stock_news(stock_name: str ): 
    """
    Get the list of news for a specific stock from the database
    The news is sorted by date in ascending order
    """
    news_collection = db.get_collection("stock_news")
    cursor = news_collection.find({"Stock": stock_name}).sort("Date", 1)
    news = await cursor.to_list(length=100)  # adjust as needed

    for item in news:
        item["_id"] = str(item["_id"])  # Convert ObjectId to string

    return news

@app.get("/stock/{stock_name}" )
async def get_stock(stock_name: str): 
    """
    Get the stock data for a specific stock
    Parameters:
    - stock_name: The name of the stock
    """
    stock_collection = db.get_collection("stock_data_v2")
    stock_data = await stock_collection.find_one({"name": stock_name})
    if stock_data:
        stock_data["_id"] = str(stock_data["_id"])  # prevent ObjectId serialization error
    return stock_data or {} # replace with your code to get the news from the database


#@app.get("/tsne_data/",
#        response_model=tsneDataModel
#    )
#async def get_tsne(stock_name: str = 'XOM') -> tsneDataModel:
#    """
#    Get the t-SNE data #for a specific stock
#    """
#    tsne_collection = db.get_collection("tsne_data")
#    tsne_point = await tsne_collection.find_one({"Ticker": stock_name})
#    return tsne_point or {} # replace with your code to get the news from the database

@app.get("/tsne_data/", 
         response_model=list[tsneDataModel]
        )
async def get_tsne():
    """
    Get t-SNE projection for all stocks
    """
    tsne_collection = db.get_collection("tsne_data")
    data = await tsne_collection.find({}).to_list(length=100)
    return data
 