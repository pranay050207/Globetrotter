from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional

class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    destinations: Optional[str] = None
    estimated_budget: Optional[float] = None
    is_public: Optional[bool] = False
    cover_image: Optional[str] = None

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_date(cls, v):
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    destinations: Optional[str] = None
    estimated_budget: Optional[float] = None
    is_public: Optional[bool] = None
    cover_image: Optional[str] = None

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_date(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class TripOut(TripBase):
    id: int
    user_id: int

    class Config:
        # Support both Pydantic v2 and v1 environments
        from_attributes = True
