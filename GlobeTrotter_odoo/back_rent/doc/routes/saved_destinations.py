from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from doc.database import get_db
from doc.models.saved_destination import SavedDestination
from doc.schemas.saved_destination_schema import SavedDestinationCreate, SavedDestinationUpdate, SavedDestinationOut
from doc.utils.security import get_current_user

router = APIRouter(prefix="/saved-destinations", tags=["Saved Destinations"])

@router.post("/", response_model=SavedDestinationOut)
def create_saved_destination(
    destination: SavedDestinationCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Save a new destination for the current user"""
    try:
        # Check if destination already exists for this user
        existing = db.query(SavedDestination).filter(
            SavedDestination.user_id == current_user.id,
            SavedDestination.city_name == destination.city_name,
            SavedDestination.country_name == destination.country_name
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Destination already saved")
        
        # Convert highlights list to JSON string if provided
        destination_data = destination.dict()
        if destination_data.get('highlights'):
            destination_data['highlights'] = json.dumps(destination_data['highlights'])
        
        new_destination = SavedDestination(**destination_data, user_id=current_user.id)
        db.add(new_destination)
        db.commit()
        db.refresh(new_destination)
        
        # Convert highlights back to list for response
        if new_destination.highlights:
            new_destination.highlights = json.loads(new_destination.highlights)
        
        return new_destination
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save destination: {str(e)}")

@router.get("/", response_model=List[SavedDestinationOut])
def get_user_saved_destinations(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Get all saved destinations for the current user"""
    try:
        destinations = db.query(SavedDestination).filter(
            SavedDestination.user_id == current_user.id
        ).order_by(SavedDestination.saved_at.desc()).all()
        
        # Convert highlights JSON back to list for each destination
        for dest in destinations:
            if dest.highlights:
                dest.highlights = json.loads(dest.highlights)
        
        return destinations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved destinations: {str(e)}")

@router.get("/{destination_id}", response_model=SavedDestinationOut)
def get_saved_destination(
    destination_id: int,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Get a specific saved destination by ID"""
    try:
        destination = db.query(SavedDestination).filter(
            SavedDestination.id == destination_id,
            SavedDestination.user_id == current_user.id
        ).first()
        
        if not destination:
            raise HTTPException(status_code=404, detail="Saved destination not found")
        
        # Convert highlights JSON back to list
        if destination.highlights:
            destination.highlights = json.loads(destination.highlights)
        
        return destination
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch destination: {str(e)}")

@router.put("/{destination_id}", response_model=SavedDestinationOut)
def update_saved_destination(
    destination_id: int,
    destination_update: SavedDestinationUpdate,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Update a saved destination"""
    try:
        destination = db.query(SavedDestination).filter(
            SavedDestination.id == destination_id,
            SavedDestination.user_id == current_user.id
        ).first()
        
        if not destination:
            raise HTTPException(status_code=404, detail="Saved destination not found")
        
        # Convert highlights list to JSON string if provided
        update_data = destination_update.dict(exclude_unset=True)
        if update_data.get('highlights'):
            update_data['highlights'] = json.dumps(update_data['highlights'])
        
        for field, value in update_data.items():
            setattr(destination, field, value)
        
        db.commit()
        db.refresh(destination)
        
        # Convert highlights back to list for response
        if destination.highlights:
            destination.highlights = json.loads(destination.highlights)
        
        return destination
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update destination: {str(e)}")

@router.delete("/{destination_id}")
def delete_saved_destination(
    destination_id: int,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Delete a saved destination"""
    try:
        destination = db.query(SavedDestination).filter(
            SavedDestination.id == destination_id,
            SavedDestination.user_id == current_user.id
        ).first()
        
        if not destination:
            raise HTTPException(status_code=404, detail="Saved destination not found")
        
        db.delete(destination)
        db.commit()
        
        return {"message": "Destination deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete destination: {str(e)}")

@router.delete("/")
def clear_all_saved_destinations(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """Clear all saved destinations for the current user"""
    try:
        db.query(SavedDestination).filter(
            SavedDestination.user_id == current_user.id
        ).delete()
        db.commit()
        
        return {"message": "All saved destinations cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to clear destinations: {str(e)}")
