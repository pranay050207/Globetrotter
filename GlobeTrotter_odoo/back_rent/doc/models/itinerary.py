from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from doc.database import Base

class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    date = Column(Date, nullable=False)
    city = Column(String(255), nullable=True)
    details = Column(String(1000), nullable=True)

    trip = relationship("Trip", backref="itineraries")
