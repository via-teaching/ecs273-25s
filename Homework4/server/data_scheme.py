from typing import Optional, List, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId
from datetime import datetime


# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockListModel(BaseModel):
    """
    Model for stock list
    """
    _id: PyObjectId
    tickers: list[str]

class PriceRecord(BaseModel):
    Date: str
    Open: float
    High: float
    Low: float
    Close: float
    Volume: int

class StockModelV1(BaseModel):
    _id: PyObjectId
    Stock: str
    TimeSeries: List[PriceRecord]  

class NewsArticle(BaseModel):
    _id: PyObjectId
    Stock: str
    Date: datetime
    Title: str
    Content: str

class TSNEPoint(BaseModel):
    _id: PyObjectId
    Symbol: str
    Sector: str
    X: float
    Y: float

class StockModelUnit(BaseModel):
    """
    Model for stock data values
    """
    date: str
    Open: float
    High: float
    Low: float
    Close: float
    
class StockModelV2(BaseModel):
    """
    Model for stock data values
    """
    _id: PyObjectId
    name: str
    stock_series: list[StockModelUnit]
    
class StockNewsModel(BaseModel):
    _id: PyObjectId
    Stock: str
    Title: str
    Date: str  
    content: str
    
class StockNewsModelList(BaseModel):
    Stock: str
    News: list[StockNewsModel]



class TSNEPoint(BaseModel):
    _id: PyObjectId
    Symbol: str
    Sector: str
    X: float
    Y: float
