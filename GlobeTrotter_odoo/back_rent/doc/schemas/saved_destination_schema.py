from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SavedDestinationBase(BaseModel):
    city_name: str
    country_name: str
    region: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    popularity: Optional[int] = None
    cost_index: Optional[int] = None
    daily_budget: Optional[str] = None
    temperature: Optional[str] = None
    best_time: Optional[str] = None
    highlights: Optional[List[str]] = None

class SavedDestinationCreate(SavedDestinationBase):
    pass

class SavedDestinationUpdate(BaseModel):
    city_name: Optional[str] = None
    country_name: Optional[str] = None
    region: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    popularity: Optional[int] = None
    cost_index: Optional[int] = None
    daily_budget: Optional[str] = None
    temperature: Optional[str] = None
    best_time: Optional[str] = None
    highlights: Optional[List[str]] = None

class SavedDestinationOut(SavedDestinationBase):
    id: int
    user_id: int
    saved_at: datetime
    
    class Config:
        from_attributes = True
