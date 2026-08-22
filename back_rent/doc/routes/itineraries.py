from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from doc.database import get_db
from doc.models.itinerary import Itinerary
from doc.models.activity import Activity
from doc.schemas.itinerary_schema import ItineraryCreate, ItineraryUpdate, ItineraryOut
from doc.utils.security import get_current_user

router = APIRouter(prefix="/itineraries", tags=["Itineraries"])

@router.post("/", response_model=ItineraryOut)
def create_itinerary(itinerary: ItineraryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    print(f"Received itinerary data: {itinerary.dict()}")
    print(f"Trip ID: {itinerary.trip_id}, Date: {itinerary.date}, City: {itinerary.city}")
    
    new_itinerary = Itinerary(**itinerary.dict())
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary

@router.get("/trip/{trip_id}", response_model=List[ItineraryOut])
def get_itineraries(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Itinerary).filter(Itinerary.trip_id == trip_id).all()

@router.get("/trip/{trip_id}/with-activities")
def get_itineraries_with_activities(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get itineraries with their associated activities for a specific trip"""
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

@router.get("/{itinerary_id}", response_model=ItineraryOut)
def get_itinerary(itinerary_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary

@router.put("/{itinerary_id}", response_model=ItineraryOut)
def update_itinerary(itinerary_id: int, itinerary_update: ItineraryUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    # Update itinerary fields (only non-None values)
    update_data = itinerary_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(itinerary, field, value)
    
    db.commit()
    db.refresh(itinerary)
    return itinerary

@router.delete("/{itinerary_id}")
def delete_itinerary(itinerary_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    db.delete(itinerary)
    db.commit()
    return {"message": "Itinerary deleted successfully"}
