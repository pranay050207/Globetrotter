from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from doc.database import get_db
from doc.models.booking import Booking
from doc.schemas.booking_schema import BookingCreate, BookingOut
from doc.utils.security import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = Booking(**payload.dict(), user_id=current_user.id)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/trip/{trip_id}", response_model=List[BookingOut])
def list_bookings_for_trip(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Booking).filter(Booking.trip_id == trip_id, Booking.user_id == current_user.id).all()

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    b = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b