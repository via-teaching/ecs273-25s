from typing import Annotated, List, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockListModel(BaseModel):
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
    date: str
    Open: float
    High: float
    Low: float
    Close: float

class StockModelV2(BaseModel):
    _id: PyObjectId
    ticker: str
    data: list[StockModelUnit]

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

class tsneDataList(BaseModel):
    ZData: list[tsneDataModel]
