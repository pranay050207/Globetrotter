from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from doc.database import Base

class SavedDestination(Base):
    __tablename__ = "saved_destinations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    city_name = Column(String(255), nullable=False)
    country_name = Column(String(255), nullable=False)
    region = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    popularity = Column(Integer, nullable=True)
    cost_index = Column(Integer, nullable=True)
    daily_budget = Column(String(100), nullable=True)
    temperature = Column(String(50), nullable=True)
    best_time = Column(String(100), nullable=True)
    highlights = Column(Text, nullable=True)  # JSON string of highlights
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", backref="saved_destinations")
