#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from doc.database import engine

def migrate_activities_table():
    """Add missing columns to the activities table in MySQL database"""
    
    print("Starting MySQL activities table migration...")
    
    # Columns to add
    new_columns = [
        ("category", "VARCHAR(100) NOT NULL DEFAULT 'sightseeing'"),
        ("subcategory", "VARCHAR(100)"),
        ("tags", "TEXT"),
        ("address", "VARCHAR(500)"),
        ("latitude", "FLOAT"),
        ("longitude", "FLOAT"),
        ("booking_url", "VARCHAR(1024)"),
        ("booking_required", "BOOLEAN DEFAULT FALSE"),
        ("max_capacity", "INTEGER"),
        ("current_bookings", "INTEGER DEFAULT 0"),
        ("gallery_images", "TEXT"),
        ("video_url", "VARCHAR(1024)"),
        ("total_reviews", "INTEGER DEFAULT 0"),
        ("review_summary", "TEXT"),
        ("difficulty_level", "VARCHAR(50)"),
        ("age_restriction", "VARCHAR(100)"),
        ("accessibility_info", "TEXT"),
        ("cancellation_policy", "TEXT"),
        ("is_active", "BOOLEAN DEFAULT TRUE"),
        ("is_featured", "BOOLEAN DEFAULT FALSE"),
        ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME")
    ]
    
    try:
        with engine.connect() as conn:
            print("Adding new columns to activities table...")
            for column_name, column_def in new_columns:
                try:
                    # Check if column already exists
                    result = conn.execute(text(f"SHOW COLUMNS FROM activities LIKE '{column_name}'"))
                    if result.fetchone():
                        print(f"⚠ Column already exists: {column_name}")
                    else:
                        # Add the column
                        conn.execute(text(f"ALTER TABLE activities ADD COLUMN {column_name} {column_def}"))
                        conn.commit()
                        print(f"✓ Added column: {column_name}")
                except Exception as e:
                    print(f"✗ Error adding column {column_name}: {e}")
                    conn.rollback()
            
            # Create activity_reviews table if it doesn't exist
            print("\nCreating activity_reviews table...")
            try:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS activity_reviews (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        activity_id INT NOT NULL,
                        user_id INT NOT NULL,
                        rating INT NOT NULL,
                        review_text TEXT,
                        review_title VARCHAR(255),
                        overall_rating INT NOT NULL,
                        value_rating INT,
                        experience_rating INT,
                        service_rating INT,
                        visit_date DATETIME,
                        is_verified_visit BOOLEAN DEFAULT FALSE,
                        helpful_votes INT DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME,
                        FOREIGN KEY (activity_id) REFERENCES activities (id),
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                """))
                conn.commit()
                print("✓ Created activity_reviews table")
            except Exception as e:
                print(f"⚠ activity_reviews table: {e}")
                conn.rollback()
            
            # Create activity_bookings table if it doesn't exist
            print("\nCreating activity_bookings table...")
            try:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS activity_bookings (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        activity_id INT NOT NULL,
                        user_id INT NOT NULL,
                        trip_id INT NOT NULL,
                        booking_date DATETIME NOT NULL,
                        number_of_people INT NOT NULL DEFAULT 1,
                        total_cost FLOAT NOT NULL,
                        currency VARCHAR(10) DEFAULT 'USD',
                        status VARCHAR(50) DEFAULT 'pending',
                        booking_reference VARCHAR(255),
                        external_booking_id VARCHAR(255),
                        contact_name VARCHAR(255),
                        contact_email VARCHAR(255),
                        contact_phone VARCHAR(50),
                        special_requests TEXT,
                        dietary_restrictions TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME,
                        FOREIGN KEY (activity_id) REFERENCES activities (id),
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        FOREIGN KEY (trip_id) REFERENCES trips (id)
                    )
                """))
                conn.commit()
                print("✓ Created activity_bookings table")
            except Exception as e:
                print(f"⚠ activity_bookings table: {e}")
                conn.rollback()
            
            # Update existing activities to have default values
            print("\nUpdating existing activities with default values...")
            try:
                conn.execute(text("""
                    UPDATE activities SET 
                        category = 'sightseeing',
                        is_active = TRUE,
                        is_featured = FALSE,
                        total_reviews = COALESCE(reviews, 0)
                    WHERE category IS NULL
                """))
                conn.commit()
                print("✓ Updated existing activities with default values")
            except Exception as e:
                print(f"⚠ Error updating existing activities: {e}")
                conn.rollback()
                
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        return False
    
    print("\n✅ MySQL activities table migration completed successfully!")
    return True

if __name__ == "__main__":
    migrate_activities_table()
