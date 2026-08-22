from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: Optional[str] = "user"

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    avatar: Optional[str]
    is_verified: bool
    phone: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    timezone: Optional[str]
    currency: Optional[str]
    language: Optional[str]
    public_profile: Optional[bool]
    two_factor_auth: Optional[bool]

    class Config:
        from_attributes = True
