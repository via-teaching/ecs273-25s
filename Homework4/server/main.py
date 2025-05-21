
'''
working urls
http://localhost:8000/stocklist
http://localhost:8000/stocknews/?stock_name=AAPL
http://localhost:8000/stockdata/AAPL
http://localhost:8000/tsne/XOM

'''
from fastapi import FastAPI # uvicorn main:app --reload
from pydantic.functional_validators import BeforeValidator
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware

from data_scheme import StockListModel, StockModelV1, StockModelV2, StockNewsModel, tsneDataModel

client = AsyncIOMotorClient("mongodb+srv://alyssayee:123@cluster0.kdapobk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client.stock_ayee

app = FastAPI(
    title="Stock tracking API",
    summary="An application tracking stock prices and respective news"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stocklist", response_model=StockListModel)
async def get_stock_list():
    print("GET /stocklist called")
    stock_name_collection = db.get_collection("stocklist")
    stock_list = await stock_name_collection.find_one()
    if stock_list:
        stock_list["_id"] = str(stock_list["_id"])
    print("Returned stock list:", stock_list)
    return stock_list

@app.get("/stocknews/", response_model=list[StockNewsModel])
async def get_stock_news(stock_name: str):
    news_collection = db.get_collection("stocknews")
    cursor = news_collection.find({"Stock": stock_name}).sort("Date", 1)
    news_list_raw = await cursor.to_list(length=100)

    # Convert ObjectIds to str
    news_list = []
    for doc in news_list_raw:
        doc["id"] = str(doc["_id"])  # Map `_id` to `id` expected by StockNewsModel
        del doc["_id"]
        news_list.append(doc)

    return news_list



from fastapi import HTTPException

from bson import ObjectId

@app.get("/stockdata/{ticker}", response_model=StockModelV1)
async def get_stock(ticker: str):
    cursor = db.stockdata.find({"Ticker": ticker})
    docs = await cursor.to_list(length=None)
    if not docs:
        raise HTTPException(status_code=404, detail=f"No stock data found for {ticker}")

    # Sort docs by Date
    docs.sort(key=lambda d: d["Date"])

    dates = []
    opens = []
    highs = []
    lows = []
    closes = []

    for doc in docs:
        dates.append(doc["Date"])
        opens.append(doc["Open"])
        highs.append(doc["High"])
        lows.append(doc["Low"])
        closes.append(doc["Close"])

    result = {
        "_id": ticker,   # or you can generate some string ID here, or omit _id if not needed
        "name": ticker,
        "date": dates,
        "Open": opens,
        "High": highs,
        "Low": lows,
        "Close": closes
    }

    return result


@app.get("/tsne/", response_model=list[tsneDataModel])
async def get_tsne(stock_name: str = None):
    print(f"GET /tsne/ called with stock_name={stock_name}")
    tsne_collection = db.get_collection("tsne")
    cursor = tsne_collection.find({"Stock": stock_name}) if stock_name else tsne_collection.find()
    docs = await cursor.to_list(length=None)
    
    # Map TSNE1 -> x and TSNE2 -> y
    cleaned = [
        {
            "_id": str(doc["_id"]),
            "Stock": doc["Stock"],
            "x": doc["TSNE1"],
            "y": doc["TSNE2"],
        }
        for doc in docs
    ]
    print(f"Returned {len(cleaned)} tsne records")
    return cleaned


