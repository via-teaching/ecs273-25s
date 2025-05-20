from typing import Optional, List, Annotated
from pydantic import BaseModel
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.

PyObjectId = Annotated[str, BeforeValidator(str)]

class StockListModel(BaseModel):
    """
    Model for the collection of available stock tickers
    Used to populate dropdown selections in the frontend
    """
    _id: PyObjectId
    tickers: list[str]
 
class StockModelUnit(BaseModel):
    """
    Model for a single day's stock trading data point
    Contains Open-High-Low-Close price values
    """
    date: str
    Open: float
    High: float
    Low: float
    Close: float
    
class StockModelV2(BaseModel):
    """
    Model for complete stock historical data for a single ticker
    """
    _id: PyObjectId
    name: str
    stock_series: list[StockModelUnit]
    
class StockNewsModel(BaseModel):
    """
    Model for stock news articles
    """
    _id: PyObjectId
    Stock: str
    Title: str
    Date: str
    URL: Optional[str] = None
    content: str
    
class StockNewsListModel(BaseModel):
    """
    Model for a list of stock news articles
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