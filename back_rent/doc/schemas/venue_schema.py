from pydantic import BaseModel
from typing import Optional

class VenueBase(BaseModel):
    name: str
    city_id: Optional[int] = None
    address: Optional[str] = None
    type: Optional[str] = None
    rating: Optional[float] = None
    price_level: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None

class VenueCreate(VenueBase):
    pass

class VenueOut(VenueBase):
    id: int

    class Config:
        from_attributes = True