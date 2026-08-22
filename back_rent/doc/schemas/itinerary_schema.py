from pydantic import BaseModel, field_validator
import datetime
from typing import Optional, Union

class ItineraryBase(BaseModel):
    trip_id: int
    date: Union[datetime.date, str]  # Accept either date or string
    city: Optional[str] = None
    details: Optional[str] = None

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                return datetime.date.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class ItineraryCreate(ItineraryBase):
    pass

class ItineraryUpdate(BaseModel):
    date: Optional[Union[datetime.date, str]] = None
    city: Optional[str] = None
    details: Optional[str] = None

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                return datetime.date.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class ItineraryOut(ItineraryBase):
    id: int

    class Config:
        from_attributes = True