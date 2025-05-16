from typing import Optional, List, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.

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
    date: str
    Open: float
    High: float
    Low: float
    Close: float

class StockModelV2(BaseModel):
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
    
class tsneDataModel(BaseModel):
    _id: PyObjectId
    Stock: str
    x: float
    y: float