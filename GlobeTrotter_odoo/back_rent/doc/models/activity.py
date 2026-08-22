from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from doc.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Enhanced categorization
    category = Column(String(100), nullable=False)  # Main category
    subcategory = Column(String(100), nullable=True)  # Subcategory
    tags = Column(Text, nullable=True)  # JSON string of tags
    
    # Location and timing
    location = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    time = Column(String(50), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # Cost and booking
    cost_amount = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    booking_url = Column(String(1024), nullable=True)
    booking_required = Column(Boolean, default=False)
    max_capacity = Column(Integer, nullable=True)
    current_bookings = Column(Integer, default=0)
    
    # Media and content
    image_url = Column(String(1024), nullable=True)
    gallery_images = Column(Text, nullable=True)  # JSON array of image URLs
    video_url = Column(String(1024), nullable=True)
    
    # Ratings and reviews
    rating = Column(Float, nullable=True)
    total_reviews = Column(Integer, default=0)
    review_summary = Column(Text, nullable=True)  # JSON with rating breakdown
    
    # Additional details
    difficulty_level = Column(String(50), nullable=True)  # Easy, Moderate, Hard
    age_restriction = Column(String(100), nullable=True)
    accessibility_info = Column(Text, nullable=True)
    cancellation_policy = Column(Text, nullable=True)
    
    # Status and metadata
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    notes = Column(Text, nullable=True)

    itinerary = relationship("Itinerary", backref="activities")

class ActivityReview(Base):
    __tablename__ = "activity_reviews"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review_text = Column(Text, nullable=True)
    review_title = Column(String(255), nullable=True)
    
    # Review categories
    overall_rating = Column(Integer, nullable=False)
    value_rating = Column(Integer, nullable=True)
    experience_rating = Column(Integer, nullable=True)
    service_rating = Column(Integer, nullable=True)
    
    # Review metadata
    visit_date = Column(DateTime, nullable=True)
    is_verified_visit = Column(Boolean, default=False)
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    activity = relationship("Activity", backref="reviews")
    user = relationship("User", backref="activity_reviews")

class ActivityBooking(Base):
    __tablename__ = "activity_bookings"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    # Booking details
    booking_date = Column(DateTime, nullable=False)
    number_of_people = Column(Integer, nullable=False, default=1)
    total_cost = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    
    # Booking status
    status = Column(String(50), default="pending")  # pending, confirmed, cancelled, completed
    booking_reference = Column(String(255), nullable=True)
    external_booking_id = Column(String(255), nullable=True)
    
    # Contact information
    contact_name = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    
    # Special requests
    special_requests = Column(Text, nullable=True)
    dietary_restrictions = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    activity = relationship("Activity", backref="bookings")
    user = relationship("User", backref="activity_bookings")
    trip = relationship("Trip", backref="activity_bookings")
