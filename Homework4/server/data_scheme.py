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
    """
    Model for stock news values
    """
    _id: PyObjectId
    Stock: str
    Title: str
    Date: str
    URL: Optional[str] = None
    content: str
    
class StockNewsListModel(BaseModel):
    """
    Model for stock news list
    """
    articles: List[StockNewsModel]

class TSNEDataPoint(BaseModel):
    """
    Model for t-SNE data points
    """
    stock: str
    x: float
    y: float
    sector: str

class tsneDataModel(BaseModel):
    """
    Model for t-SNE data model
    """
    data: List[TSNEDataPoint]