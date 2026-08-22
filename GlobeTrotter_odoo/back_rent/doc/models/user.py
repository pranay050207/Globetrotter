from sqlalchemy import Column, Integer, String, Boolean, Text
from doc.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # user, admin
    avatar = Column(String(1024), nullable=True)
    is_verified = Column(Boolean, default=False)
    otp = Column(String(20), nullable=True)
    
    # Additional profile fields
    phone = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    timezone = Column(String(100), default="Asia/Kolkata")
    currency = Column(String(10), default="INR")
    language = Column(String(10), default="en")
    public_profile = Column(Boolean, default=False)
    two_factor_auth = Column(Boolean, default=False)
