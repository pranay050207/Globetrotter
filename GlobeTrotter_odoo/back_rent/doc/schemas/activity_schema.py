from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ActivityBase(BaseModel):
    itinerary_id: int
    name: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    tags: Optional[str] = None  # JSON string of tags
    
    # Location and timing
    location: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    time: Optional[str] = None
    duration_minutes: Optional[int] = None
    
    # Cost and booking
    cost_amount: Optional[float] = None
    currency: str = "INR"
    booking_url: Optional[str] = None
    booking_required: bool = False
    max_capacity: Optional[int] = None
    current_bookings: int = 0
    
    # Media and content
    image_url: Optional[str] = None
    gallery_images: Optional[str] = None  # JSON array of image URLs
    video_url: Optional[str] = None
    
    # Ratings and reviews
    rating: Optional[float] = None
    total_reviews: int = 0
    review_summary: Optional[str] = None  # JSON with rating breakdown
    
    # Additional details
    difficulty_level: Optional[str] = None
    age_restriction: Optional[str] = None
    accessibility_info: Optional[str] = None
    cancellation_policy: Optional[str] = None
    
    # Status and metadata
    is_active: bool = True
    is_featured: bool = False
    notes: Optional[str] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    time: Optional[str] = None
    duration_minutes: Optional[int] = None
    cost_amount: Optional[float] = None
    currency: Optional[str] = None
    booking_url: Optional[str] = None
    booking_required: Optional[bool] = None
    max_capacity: Optional[int] = None
    image_url: Optional[str] = None
    gallery_images: Optional[str] = None
    video_url: Optional[str] = None
    difficulty_level: Optional[str] = None
    age_restriction: Optional[str] = None
    accessibility_info: Optional[str] = None
    cancellation_policy: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    notes: Optional[str] = None

class ActivityOut(ActivityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Review Schemas
class ActivityReviewBase(BaseModel):
    activity_id: int
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    review_title: Optional[str] = None
    overall_rating: int = Field(..., ge=1, le=5)
    value_rating: Optional[int] = Field(None, ge=1, le=5)
    experience_rating: Optional[int] = Field(None, ge=1, le=5)
    service_rating: Optional[int] = Field(None, ge=1, le=5)
    visit_date: Optional[datetime] = None

class ActivityReviewCreate(ActivityReviewBase):
    pass

class ActivityReviewOut(ActivityReviewBase):
    id: int
    user_id: int
    is_verified_visit: bool
    helpful_votes: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    class Config:
        from_attributes = True

# Booking Schemas
class ActivityBookingBase(BaseModel):
    activity_id: int
    trip_id: int
    booking_date: datetime
    number_of_people: int = Field(..., ge=1)
    total_cost: float
    currency: str = "INR"
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    special_requests: Optional[str] = None
    dietary_restrictions: Optional[str] = None

class ActivityBookingCreate(ActivityBookingBase):
    pass

class ActivityBookingUpdate(BaseModel):
    status: Optional[str] = None
    booking_reference: Optional[str] = None
    external_booking_id: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    special_requests: Optional[str] = None
    dietary_restrictions: Optional[str] = None

class ActivityBookingOut(ActivityBookingBase):
    id: int
    user_id: int
    status: str
    booking_reference: Optional[str] = None
    external_booking_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    activity_name: Optional[str] = None
    trip_title: Optional[str] = None

    class Config:
        from_attributes = True

# Activity Search and Filter Schemas
class ActivitySearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_duration: Optional[int] = None
    max_duration: Optional[int] = None
    min_rating: Optional[float] = None
    difficulty_level: Optional[str] = None
    booking_required: Optional[bool] = None
    is_featured: Optional[bool] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    page: int = 1
    limit: int = 20

# Activity Categories
class ActivityCategory(BaseModel):
    category: str
    subcategories: List[str]
    icon: str
    color: str
    description: str

# Activity Statistics
class ActivityStats(BaseModel):
    total_activities: int
    total_reviews: int
    average_rating: float
    total_bookings: int
    categories_count: Dict[str, int]
    price_range: Dict[str, float]
