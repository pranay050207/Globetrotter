from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from doc.database import Base

class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    address = Column(String(255), nullable=True)
    type = Column(String(100), nullable=True)
    rating = Column(Float, nullable=True)
    price_level = Column(Integer, nullable=True)  # 1-4
    description = Column(String(1000), nullable=True)
    image_url = Column(String(1024), nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)

    city = relationship("City", backref="venues")