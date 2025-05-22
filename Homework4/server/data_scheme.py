from typing import Optional, List, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockListModel(BaseModel):
    """
    Model for stock list
    """
    _id: PyObjectId
    tickers: list[str]

class StockModelV1(BaseModel):
    """
    Model for stock data values
    """
    _id: PyObjectId
    name: str
    date: list[str]
    Open: list[float]
    High: list[float]
    Low: list[float]
    Close: list[float]
    
class StockModelUnit(BaseModel):
    """
    Model for stock data values
    """
    Date: str
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
    filename: str
    date: str
    title: str  
    body: str
    
class StockNewsModelList(BaseModel):
    Stock: str
    News: list[StockNewsModel]



class tsneDataModel(BaseModel):
    """
    Model for t-SNE data
    """
    ticker: str
    x: float
    y: float
    type: str

class tsneModelList(BaseModel):
    _id: PyObjectId
    Values: list[tsneDataModel]