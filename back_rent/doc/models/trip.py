from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, Boolean
from sqlalchemy.orm import relationship
from doc.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    destinations = Column(String(1000), nullable=True)  # comma-separated list
    estimated_budget = Column(Float, nullable=True)
    is_public = Column(Boolean, default=False)
    cover_image = Column(String(1024), nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", backref="trips")
