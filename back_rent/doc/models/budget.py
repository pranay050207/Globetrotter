from sqlalchemy import Column, Integer, Float, ForeignKey,String
from sqlalchemy.orm import relationship
from doc.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(255), nullable=False)

    trip = relationship("Trip", backref="budgets")
