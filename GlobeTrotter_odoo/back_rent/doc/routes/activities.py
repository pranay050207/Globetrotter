from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional
import json
from datetime import datetime

from doc.database import get_db
from doc.models.activity import Activity, ActivityReview, ActivityBooking
from doc.models.user import User
from doc.models.trip import Trip
from doc.schemas.activity_schema import (
    ActivityCreate, ActivityOut, ActivityUpdate, ActivitySearchParams,
    ActivityReviewCreate, ActivityReviewOut, ActivityBookingCreate, 
    ActivityBookingOut, ActivityBookingUpdate, ActivityCategory, ActivityStats
)
from doc.utils.security import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])

# Activity Categories Configuration
ACTIVITY_CATEGORIES = {
    "sightseeing": {
        "subcategories": ["Landmarks", "Monuments", "Museums", "Parks", "Viewpoints"],
        "icon": "🏛️",
        "color": "bg-blue-100 text-blue-800",
        "description": "Explore famous landmarks and cultural sites"
    },
    "adventure": {
        "subcategories": ["Hiking", "Water Sports", "Rock Climbing", "Zip Lining", "Bungee Jumping"],
        "icon": "🏔️",
        "color": "bg-green-100 text-green-800",
        "description": "Thrilling outdoor activities and adventures"
    },
    "food": {
        "subcategories": ["Restaurants", "Food Tours", "Cooking Classes", "Wine Tasting", "Street Food"],
        "icon": "🍽️",
        "color": "bg-orange-100 text-orange-800",
        "description": "Culinary experiences and dining"
    },
    "culture": {
        "subcategories": ["Art Galleries", "Theaters", "Historical Tours", "Local Markets", "Festivals"],
        "icon": "🎨",
        "color": "bg-purple-100 text-purple-800",
        "description": "Cultural and artistic experiences"
    },
    "relaxation": {
        "subcategories": ["Spas", "Beaches", "Hot Springs", "Yoga Classes", "Meditation"],
        "icon": "🧘",
        "color": "bg-pink-100 text-pink-800",
        "description": "Relaxing and wellness activities"
    },
    "transport": {
        "subcategories": ["Car Rentals", "Bike Tours", "Boat Tours", "Helicopter Tours", "Walking Tours"],
        "icon": "🚗",
        "color": "bg-gray-100 text-gray-800",
        "description": "Transportation and guided tours"
    },
    "entertainment": {
        "subcategories": ["Nightlife", "Casinos", "Theme Parks", "Live Music", "Sports Events"],
        "icon": "🎭",
        "color": "bg-yellow-100 text-yellow-800",
        "description": "Entertainment and nightlife"
    },
    "shopping": {
        "subcategories": ["Malls", "Local Markets", "Boutiques", "Souvenirs", "Antiques"],
        "icon": "🛍️",
        "color": "bg-indigo-100 text-indigo-800",
        "description": "Shopping and retail experiences"
    }
}

# Activity CRUD Operations
@router.post("/", response_model=ActivityOut)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new activity"""
    new_activity = Activity(**activity.dict())
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    return new_activity

@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific activity by ID"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(activity_id: int, activity_update: ActivityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update an activity"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    update_data = activity_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    
    activity.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(activity)
    return activity

@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete an activity"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted successfully"}

@router.get("/itinerary/{itinerary_id}", response_model=List[ActivityOut])
def get_activities_by_itinerary(itinerary_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all activities for a specific itinerary"""
    activities = db.query(Activity).filter(Activity.itinerary_id == itinerary_id).all()
    return activities

# Activity Search and Discovery
@router.get("/search/", response_model=List[ActivityOut])
def search_activities(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Activity category"),
    subcategory: Optional[str] = Query(None, description="Activity subcategory"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_duration: Optional[int] = Query(None, description="Minimum duration in minutes"),
    max_duration: Optional[int] = Query(None, description="Maximum duration in minutes"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    difficulty_level: Optional[str] = Query(None, description="Difficulty level"),
    booking_required: Optional[bool] = Query(None, description="Booking required"),
    is_featured: Optional[bool] = Query(None, description="Featured activities only"),
    location: Optional[str] = Query(None, description="Location filter"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Search and filter activities"""
    query_builder = db.query(Activity).filter(Activity.is_active == True)
    
    if query:
        query_builder = query_builder.filter(
            or_(
                Activity.name.ilike(f"%{query}%"),
                Activity.description.ilike(f"%{query}%"),
                Activity.location.ilike(f"%{query}%")
            )
        )
    
    if category:
        query_builder = query_builder.filter(Activity.category == category)
    
    if subcategory:
        query_builder = query_builder.filter(Activity.subcategory == subcategory)
    
    if min_price is not None:
        query_builder = query_builder.filter(Activity.cost_amount >= min_price)
    
    if max_price is not None:
        query_builder = query_builder.filter(Activity.cost_amount <= max_price)
    
    if min_duration is not None:
        query_builder = query_builder.filter(Activity.duration_minutes >= min_duration)
    
    if max_duration is not None:
        query_builder = query_builder.filter(Activity.duration_minutes <= max_duration)
    
    if min_rating is not None:
        query_builder = query_builder.filter(Activity.rating >= min_rating)
    
    if difficulty_level:
        query_builder = query_builder.filter(Activity.difficulty_level == difficulty_level)
    
    if booking_required is not None:
        query_builder = query_builder.filter(Activity.booking_required == booking_required)
    
    if is_featured is not None:
        query_builder = query_builder.filter(Activity.is_featured == is_featured)
    
    if location:
        query_builder = query_builder.filter(Activity.location.ilike(f"%{location}%"))
    
    # Pagination
    offset = (page - 1) * limit
    activities = query_builder.offset(offset).limit(limit).all()
    
    return activities

@router.get("/categories/", response_model=List[ActivityCategory])
def get_activity_categories():
    """Get all available activity categories"""
    categories = []
    for category, details in ACTIVITY_CATEGORIES.items():
        categories.append(ActivityCategory(
            category=category,
            subcategories=details["subcategories"],
            icon=details["icon"],
            color=details["color"],
            description=details["description"]
        ))
    return categories

@router.get("/featured/", response_model=List[ActivityOut])
def get_featured_activities(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Get featured activities"""
    activities = db.query(Activity).filter(
        and_(Activity.is_featured == True, Activity.is_active == True)
    ).order_by(desc(Activity.rating)).limit(limit).all()
    return activities

@router.get("/stats/", response_model=ActivityStats)
def get_activity_stats(db: Session = Depends(get_db)):
    """Get activity statistics"""
    total_activities = db.query(func.count(Activity.id)).scalar()
    total_reviews = db.query(func.count(ActivityReview.id)).scalar()
    average_rating = db.query(func.avg(Activity.rating)).scalar() or 0.0
    total_bookings = db.query(func.count(ActivityBooking.id)).scalar()
    
    # Category counts
    categories_count = {}
    for category in ACTIVITY_CATEGORIES.keys():
        count = db.query(func.count(Activity.id)).filter(Activity.category == category).scalar()
        categories_count[category] = count
    
    # Price range
    min_price = db.query(func.min(Activity.cost_amount)).scalar() or 0.0
    max_price = db.query(func.max(Activity.cost_amount)).scalar() or 0.0
    
    return ActivityStats(
        total_activities=total_activities,
        total_reviews=total_reviews,
        average_rating=round(average_rating, 2),
        total_bookings=total_bookings,
        categories_count=categories_count,
        price_range={"min": min_price, "max": max_price}
    )

# Review Operations
@router.post("/{activity_id}/reviews/", response_model=ActivityReviewOut)
def create_activity_review(
    activity_id: int, 
    review: ActivityReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a review for an activity"""
    # Check if activity exists
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Check if user already reviewed this activity
    existing_review = db.query(ActivityReview).filter(
        and_(ActivityReview.activity_id == activity_id, ActivityReview.user_id == current_user.id)
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this activity")
    
    new_review = ActivityReview(
        activity_id=activity_id,
        user_id=current_user.id,
        **review.dict()
    )
    
    db.add(new_review)
    
    # Update activity rating
    activity_reviews = db.query(ActivityReview).filter(ActivityReview.activity_id == activity_id).all()
    total_rating = sum([r.overall_rating for r in activity_reviews]) + review.overall_rating
    activity.rating = total_rating / (len(activity_reviews) + 1)
    activity.total_reviews = len(activity_reviews) + 1
    
    db.commit()
    db.refresh(new_review)
    
    # Add user info to response
    new_review.user_name = current_user.full_name
    new_review.user_avatar = current_user.avatar
    
    return new_review

@router.get("/{activity_id}/reviews/", response_model=List[ActivityReviewOut])
def get_activity_reviews(
    activity_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get reviews for an activity"""
    offset = (page - 1) * limit
    reviews = db.query(ActivityReview).filter(
        ActivityReview.activity_id == activity_id
    ).order_by(desc(ActivityReview.created_at)).offset(offset).limit(limit).all()
    
    # Add user info to each review
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        if user:
            review.user_name = user.full_name
            review.user_avatar = user.avatar
    
    return reviews

# Booking Operations
@router.post("/{activity_id}/bookings/", response_model=ActivityBookingOut)
def create_activity_booking(
    activity_id: int,
    booking: ActivityBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a booking for an activity"""
    # Check if activity exists
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Check if trip exists
    trip = db.query(Trip).filter(Trip.id == booking.trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Check capacity if booking is required
    if activity.booking_required and activity.max_capacity:
        if activity.current_bookings + booking.number_of_people > activity.max_capacity:
            raise HTTPException(status_code=400, detail="Activity is fully booked")
    
    new_booking = ActivityBooking(
        activity_id=activity_id,
        user_id=current_user.id,
        **booking.dict()
    )
    
    db.add(new_booking)
    
    # Update activity booking count
    if activity.booking_required:
        activity.current_bookings += booking.number_of_people
    
    db.commit()
    db.refresh(new_booking)
    
    # Add activity and trip info to response
    new_booking.activity_name = activity.name
    new_booking.trip_title = trip.title
    
    return new_booking

@router.get("/bookings/", response_model=List[ActivityBookingOut])
def get_user_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for the current user"""
    bookings = db.query(ActivityBooking).filter(
        ActivityBooking.user_id == current_user.id
    ).order_by(desc(ActivityBooking.created_at)).all()
    
    # Add activity and trip info to each booking
    for booking in bookings:
        activity = db.query(Activity).filter(Activity.id == booking.activity_id).first()
        trip = db.query(Trip).filter(Trip.id == booking.trip_id).first()
        if activity:
            booking.activity_name = activity.name
        if trip:
            booking.trip_title = trip.title
    
    return bookings

@router.put("/bookings/{booking_id}", response_model=ActivityBookingOut)
def update_booking(
    booking_id: int,
    booking_update: ActivityBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a booking"""
    booking = db.query(ActivityBooking).filter(
        and_(ActivityBooking.id == booking_id, ActivityBooking.user_id == current_user.id)
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = booking_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    
    # Add activity and trip info to response
    activity = db.query(Activity).filter(Activity.id == booking.activity_id).first()
    trip = db.query(Trip).filter(Trip.id == booking.trip_id).first()
    if activity:
        booking.activity_name = activity.name
    if trip:
        booking.trip_title = trip.title
    
    return booking

@router.delete("/bookings/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking"""
    booking = db.query(ActivityBooking).filter(
        and_(ActivityBooking.id == booking_id, ActivityBooking.user_id == current_user.id)
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
    
    booking.status = "cancelled"
    booking.updated_at = datetime.utcnow()
    
    # Update activity booking count
    activity = db.query(Activity).filter(Activity.id == booking.activity_id).first()
    if activity and activity.booking_required:
        activity.current_bookings = max(0, activity.current_bookings - booking.number_of_people)
    
    db.commit()
    return {"message": "Booking cancelled successfully"}
