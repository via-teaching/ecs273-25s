from typing import Optional, List, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId
from datetime import datetime

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockListModel(BaseModel):
    _id: PyObjectId
    tickers: list[str]

class StockModelV1(BaseModel):
    _id: PyObjectId
    name: str
    date: list[str]
    Open: list[float]
    High: list[float]
    Low: list[float]
    Close: list[float]

class StockModelUnit(BaseModel):
    date: datetime          # lowercase
    open: float        # lowercase
    high: float        # lowercase
    low: float         # lowercase
    close: float       # lowercase

class StockModelV2(BaseModel):
    _id: PyObjectId    # Required field
    name: str
    stock_series: list[StockModelUnit]  # Expects lowercase keys
    
class StockNewsModel(BaseModel):
    _id: PyObjectId
    Stock: str
    Title: str
    Date: str  
    content: str
    
class StockNewsModelList(BaseModel):
    Stock: str
    News: list[StockNewsModel]

class tsneDataModel(BaseModel):
    """
    Model for t-SNE data
    """
    _id: PyObjectId
    Stock: str
    x: float
    y: float