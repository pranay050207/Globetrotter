from sqlalchemy import Column, Integer, String, Float
from doc.database import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    country = Column(String(255), nullable=False)

    # Optional metadata used by frontend
    region = Column(String(100), nullable=True)
    rating = Column(Float, nullable=True)
    popularity = Column(Integer, nullable=True)
    cost_index = Column(Integer, nullable=True)
    daily_budget = Column(String(50), nullable=True)
    temperature = Column(String(50), nullable=True)
    best_time = Column(String(100), nullable=True)
    highlights = Column(String(1000), nullable=True)  # comma-separated list
    image_url = Column(String(1024), nullable=True)
    description = Column(String(1000), nullable=True)
