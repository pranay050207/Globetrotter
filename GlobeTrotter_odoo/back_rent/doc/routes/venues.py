from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from doc.database import get_db
from doc.models.venue import Venue
from doc.schemas.venue_schema import VenueCreate, VenueOut

router = APIRouter(prefix="/venues", tags=["Venues"])

@router.post("/", response_model=VenueOut)
def create_venue(venue: VenueCreate, db: Session = Depends(get_db)):
    v = Venue(**venue.dict())
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@router.get("/", response_model=List[VenueOut])
def list_venues(db: Session = Depends(get_db), city_id: Optional[int] = None, q: Optional[str] = None):
    query = db.query(Venue)
    if city_id is not None:
        query = query.filter(Venue.city_id == city_id)
    if q:
        like = f"%{q}%"
        query = query.filter(Venue.name.ilike(like))
    return query.limit(100).all()

@router.get("/{venue_id}", response_model=VenueOut)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    v = db.get(Venue, venue_id)
    if not v:
        raise HTTPException(status_code=404, detail="Venue not found")
    return v