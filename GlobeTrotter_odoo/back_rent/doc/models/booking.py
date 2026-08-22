from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, func
from sqlalchemy.orm import relationship
from doc.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=True)

    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    price = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    status = Column(String(20), default="pending")
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    trip = relationship("Trip", backref="bookings")
    user = relationship("User")
    activity = relationship("Activity")
    venue = relationship("Venue")