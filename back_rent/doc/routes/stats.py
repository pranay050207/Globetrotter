from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from doc.database import get_db
from doc.models import User, Trip, City, Activity, Itinerary, Booking
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

class GlobalStats(BaseModel):
    total_travelers: int
    total_countries: int
    total_trips: int
    total_activities: int
    total_cities: int
    total_itineraries: int
    total_bookings: int

@router.get("/stats/global", response_model=GlobalStats)
def get_global_statistics(db: Session = Depends(get_db)):
    """Get global statistics for the home page"""
    try:
        # Count total users (travelers)
        total_travelers = db.query(func.count(User.id)).scalar()
        
        # Count unique countries from cities
        total_countries = db.query(func.count(distinct(City.country))).scalar()
        
        # Count total trips
        total_trips = db.query(func.count(Trip.id)).scalar()
        
        # Count total activities
        total_activities = db.query(func.count(Activity.id)).scalar()
        
        # Count total cities
        total_cities = db.query(func.count(City.id)).scalar()
        
        # Count total itineraries
        total_itineraries = db.query(func.count(Itinerary.id)).scalar()
        
        # Count total bookings
        total_bookings = db.query(func.count(Booking.id)).scalar()
        
        return GlobalStats(
            total_travelers=total_travelers or 0,
            total_countries=total_countries or 0,
            total_trips=total_trips or 0,
            total_activities=total_activities or 0,
            total_cities=total_cities or 0,
            total_itineraries=total_itineraries or 0,
            total_bookings=total_bookings or 0
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

@router.get("/stats/homepage")
def get_homepage_statistics(db: Session = Depends(get_db)):
    """Get formatted statistics specifically for the home page display"""
    try:
        # Get raw counts
        total_travelers = db.query(func.count(User.id)).scalar() or 0
        total_countries = db.query(func.count(distinct(City.country))).scalar() or 0
        total_trips = db.query(func.count(Trip.id)).scalar() or 0
        
        # Format for display (add K+ for thousands, M+ for millions)
        def format_number(num):
            if num >= 1000000:
                return f"{num // 1000000}M+"
            elif num >= 1000:
                return f"{num // 1000}K+"
            else:
                return str(num)
        
        return {
            "travelers": {
                "count": total_travelers,
                "display": format_number(total_travelers),
                "label": "Happy Travelers"
            },
            "countries": {
                "count": total_countries,
                "display": f"{total_countries}+",
                "label": "Countries Covered"
            },
            "trips": {
                "count": total_trips,
                "display": format_number(total_trips),
                "label": "Trips Planned"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch homepage statistics: {str(e)}")
