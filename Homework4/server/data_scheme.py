from typing import Optional, List, Annotated
from pydantic import BaseModel, Field
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockListModel(BaseModel):
    """
    Model for stock list
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    tickers: list[str]

    class Config:
        populate_by_name = True

class StockModelV1(BaseModel):
    """
    Model for stock data values
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    date: list[str]
    Open: list[float]
    High: list[float]
    Low: list[float]
    Close: list[float]

    class Config:
        populate_by_name = True
    
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
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    stock_series: list[StockModelUnit]

    class Config:
        populate_by_name = True
    
class StockNewsModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    Stock: str
    Title: str
    Date: str  
    content: str

    class Config:
        populate_by_name = True
    
class StockNewsModelList(BaseModel):
    Stock: str
    News: list[StockNewsModel]

class tsneDataModel(BaseModel):
    """
    Model for t-SNE data
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    ticker: str
    x: float
    y: float

    class Config:
        populate_by_name = True

class APIResponse(BaseModel):
    """
    Generic API response model
    """
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    """
    Error response model
    """
    success: bool = False
    error: str
    message: str
    details: Optional[str] = None

class NewsItem(BaseModel):
    stock: str
    date: str
    title: str
    content: str
    _id: Optional[str] = None