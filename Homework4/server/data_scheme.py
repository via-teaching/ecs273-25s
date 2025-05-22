from typing import Optional, List, Dict, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId
from datetime import datetime, date

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockPrice(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockNewsModel(BaseModel):
    ticker: str
    date: datetime
    title: str
    content: str
    url: Optional[str] = None

class StockListItem(BaseModel):
    ticker: str
    sector: Optional[str] = None
    company: Optional[str] = None

class TSNEPoint(BaseModel):
    x: float
    y: float

class StockRecord(BaseModel):
    ticker: str
    sector: Optional[str] = None
    company: Optional[str] = None
    prices: List[StockPrice]
    tsne: Optional[TSNEPoint] = None

class StockListResponse(BaseModel):
    stocks: List[StockListItem]

class StockNewsModel(BaseModel):
    _id: PyObjectId
    date: datetime
    ticker: str
    title: str
    url: str
    content: str

class TsneDataModel(BaseModel):
    """
    Model for t-SNE data
    """
    _id: PyObjectId
    ticker: str
    x: float
    y: float



# class StockListModel(BaseModel):
#     """
#     Model for stock list
#     """
#     _id: PyObjectId
#     tickers: list[str]

# class StockModelV1(BaseModel):
#     """
#     Model for stock data values
#     """
#     _id: PyObjectId
#     name: str
#     date: list[str]
#     Open: list[float]
#     High: list[float]
#     Low: list[float]
#     Close: list[float]
#     Volume: list[int]
    
# class StockModelUnit(BaseModel):
#     """
#     Model for stock data values
#     """
#     date: datetime
#     Open: float
#     High: float
#     Low: float
#     Close: float
#     Volume: int
    
# class StockModelV2(BaseModel):
#     """
#     Model for stock data values
#     """
#     _id: PyObjectId
#     name: str
#     stock_series: list[StockModelUnit]
    

    
# class StockNewsModel(BaseModel):
#     _id: PyObjectId
#     date: datetime
#     Stock: str
#     Title: str
#     Date: str  
#     URL: str
#     content: str
    
# class StockNewsModelList(BaseModel):
#     Stock: str
#     News: list[StockNewsModel]

# class tsneDataModel(BaseModel):
#     """
#     Model for t-SNE data
#     """
#     _id: PyObjectId
#     Stock: str
#     x: float
#     y: float
