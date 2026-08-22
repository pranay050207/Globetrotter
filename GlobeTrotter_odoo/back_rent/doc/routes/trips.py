from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from doc.database import get_db
from doc.models.trip import Trip
from doc.models.itinerary import Itinerary
from doc.models.activity import Activity
from doc.schemas.trip_schema import TripCreate, TripUpdate, TripOut
from doc.schemas.itinerary_schema import ItineraryCreate, ItineraryUpdate, ItineraryOut
from doc.utils.security import get_current_user

router = APIRouter(prefix="/trips", tags=["Trips"])

# Public endpoint for fetching shared trips (no authentication required)
@router.get("/public/{trip_id}", response_model=TripOut)
def get_public_trip(trip_id: int, db: Session = Depends(get_db)):
    """Get a public trip by ID - no authentication required"""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.is_public == True).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    return trip

# Public endpoint for fetching shared trip itineraries with activities
@router.get("/public/{trip_id}/itineraries/with-activities")
def get_public_trip_itineraries_with_activities(trip_id: int, db: Session = Depends(get_db)):
    """Get itineraries with their associated activities for a public trip - no authentication required"""
    # First verify the trip is public
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.is_public == True).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    
    itineraries = db.query(Itinerary).filter(Itinerary.trip_id == trip_id).all()
    
    result = []
    for itinerary in itineraries:
        # Get activities for this itinerary
        activities = db.query(Activity).filter(Activity.itinerary_id == itinerary.id).all()
        
        # Convert to dictionary and add activities
        itinerary_dict = {
            "id": itinerary.id,
            "trip_id": itinerary.trip_id,
            "date": itinerary.date,
            "city": itinerary.city,
            "details": itinerary.details,
            "activities": activities
        }
        result.append(itinerary_dict)
    
    return result

@router.post("/", response_model=TripOut)
def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        # Validate dates
        if trip.start_date >= trip.end_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        new_trip = Trip(**trip.dict(), user_id=current_user.id)
        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)
        return new_trip
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create trip: {str(e)}")

@router.get("/", response_model=List[TripOut])
def get_trips(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Trip).filter(Trip.user_id == current_user.id).all()

@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Update trip fields (only non-None values)
    update_data = trip_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)
    
    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}

# Itinerary endpoints for trips
@router.get("/{trip_id}/itineraries", response_model=List[ItineraryOut])
def get_trip_itineraries(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get all itineraries for a specific trip"""
    # First verify the trip belongs to the current user
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    return db.query(Itinerary).filter(Itinerary.trip_id == trip_id).all()

@router.get("/{trip_id}/itineraries/with-activities")
def get_trip_itineraries_with_activities(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get itineraries with their associated activities for a specific trip"""
    # First verify the trip belongs to the current user
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    itineraries = db.query(Itinerary).filter(Itinerary.trip_id == trip_id).all()
    
    result = []
    for itinerary in itineraries:
        # Get activities for this itinerary
        activities = db.query(Activity).filter(Activity.itinerary_id == itinerary.id).all()
        
        # Convert to dictionary and add activities
        itinerary_dict = {
            "id": itinerary.id,
            "trip_id": itinerary.trip_id,
            "date": itinerary.date,
            "city": itinerary.city,
            "details": itinerary.details,
            "activities": activities
        }
        result.append(itinerary_dict)
    
    return result

@router.post("/{trip_id}/itineraries", response_model=ItineraryOut)
def create_trip_itinerary(trip_id: int, itinerary: ItineraryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Create a new itinerary for a specific trip"""
    # First verify the trip belongs to the current user
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Override the trip_id to ensure it matches the URL parameter
    itinerary_data = itinerary.dict()
    itinerary_data["trip_id"] = trip_id
    
    new_itinerary = Itinerary(**itinerary_data)
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary
