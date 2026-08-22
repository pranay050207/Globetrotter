from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from doc.database import get_db
from doc.models.city import City
from doc.schemas.city_schema import CityCreate, CityOut
from doc.utils.security import get_current_user

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.post("/", response_model=CityOut)
def create_city(city: CityCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    new_city = City(**city.dict())
    db.add(new_city)
    db.commit()
    db.refresh(new_city)
    return new_city

@router.get("/", response_model=List[CityOut])
def get_cities(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(City).all()
