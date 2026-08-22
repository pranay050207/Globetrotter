#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from doc.database import engine

def check_table_schema():
    print("Checking activities table schema...")
    
    try:
        with engine.connect() as conn:
            # Get table structure
            result = conn.execute(text("DESCRIBE activities"))
            columns = result.fetchall()
            
            print("Current columns in activities table:")
            for column in columns:
                print(f"  - {column[0]} ({column[1]})")
                
            # Check if specific columns exist
            column_names = [col[0] for col in columns]
            
            required_columns = [
                'category', 'subcategory', 'tags', 'address', 'latitude', 
                'longitude', 'booking_url', 'booking_required', 'max_capacity',
                'current_bookings', 'gallery_images', 'video_url', 'total_reviews',
                'review_summary', 'difficulty_level', 'age_restriction',
                'accessibility_info', 'cancellation_policy', 'is_active',
                'is_featured', 'created_at', 'updated_at'
            ]
            
            print("\nMissing columns:")
            for col in required_columns:
                if col not in column_names:
                    print(f"  - {col}")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_table_schema()
