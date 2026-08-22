from pydantic import BaseModel
from typing import Optional

class CityBase(BaseModel):
    name: str
    country: str
    region: Optional[str] = None
    rating: Optional[float] = None
    popularity: Optional[int] = None
    cost_index: Optional[int] = None
    daily_budget: Optional[str] = None
    temperature: Optional[str] = None
    best_time: Optional[str] = None
    highlights: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

class CityCreate(CityBase):
    pass

class CityOut(CityBase):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True
