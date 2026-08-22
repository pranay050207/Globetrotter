import sqlite3
import json

def enhance_activity_tables():
    """Add new activity-related tables and columns to the database using sqlite3"""
    
    # Connect to the database
    conn = sqlite3.connect('globe_trotter.db')
    cursor = conn.cursor()
    
    try:
        # Add new columns to activities table
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
        
        print("Adding new columns to activities table...")
        for column_name, column_def in new_columns:
            try:
                cursor.execute(f"ALTER TABLE activities ADD COLUMN {column_name} {column_def}")
                print(f"✓ Added column: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"⚠ Column already exists: {column_name}")
                else:
                    print(f"✗ Error adding column {column_name}: {e}")
        
        # Create activity_reviews table
        print("\nCreating activity_reviews table...")
        try:
            cursor.execute("""
                CREATE TABLE activity_reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    activity_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    rating INTEGER NOT NULL,
                    review_text TEXT,
                    review_title VARCHAR(255),
                    overall_rating INTEGER NOT NULL,
                    value_rating INTEGER,
                    experience_rating INTEGER,
                    service_rating INTEGER,
                    visit_date DATETIME,
                    is_verified_visit BOOLEAN DEFAULT FALSE,
                    helpful_votes INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (activity_id) REFERENCES activities (id),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            print("✓ Created activity_reviews table")
        except sqlite3.OperationalError as e:
            if "already exists" in str(e).lower():
                print("⚠ activity_reviews table already exists")
            else:
                print(f"✗ Error creating activity_reviews table: {e}")
        
        # Create activity_bookings table
        print("\nCreating activity_bookings table...")
        try:
            cursor.execute("""
                CREATE TABLE activity_bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    activity_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    trip_id INTEGER NOT NULL,
                    booking_date DATETIME NOT NULL,
                    number_of_people INTEGER NOT NULL DEFAULT 1,
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
            """)
            print("✓ Created activity_bookings table")
        except sqlite3.OperationalError as e:
            if "already exists" in str(e).lower():
                print("⚠ activity_bookings table already exists")
            else:
                print(f"✗ Error creating activity_bookings table: {e}")
        
        # Update existing activities with default category
        print("\nUpdating existing activities with default category...")
        try:
            cursor.execute("UPDATE activities SET category = 'sightseeing' WHERE category IS NULL")
            print("✓ Updated existing activities with default category")
        except Exception as e:
            print(f"✗ Error updating activities: {e}")
        
        # Insert sample activity data
        print("\nInserting sample activity data...")
        sample_activities = [
            {
                "itinerary_id": 1,
                "name": "Eiffel Tower Visit",
                "description": "Visit the iconic Eiffel Tower and enjoy breathtaking views of Paris",
                "category": "sightseeing",
                "subcategory": "Landmarks",
                "location": "Paris, France",
                "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
                "latitude": 48.8584,
                "longitude": 2.2945,
                "time": "16:30",
                "duration_minutes": 180,
                "cost_amount": 25.0,
                "currency": "USD",
                "booking_required": True,
                "max_capacity": 50,
                "image_url": "https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=300",
                "rating": 4.8,
                "total_reviews": 15420,
                "difficulty_level": "Easy",
                "age_restriction": "All ages",
                "is_featured": True,
                "notes": "Book tickets in advance to avoid long queues"
            },
            {
                "itinerary_id": 1,
                "name": "Louvre Museum Tour",
                "description": "Explore world-famous artworks including the Mona Lisa",
                "category": "culture",
                "subcategory": "Museums",
                "location": "Paris, France",
                "address": "Rue de Rivoli, 75001 Paris, France",
                "latitude": 48.8606,
                "longitude": 2.3376,
                "time": "09:00",
                "duration_minutes": 240,
                "cost_amount": 20.0,
                "currency": "USD",
                "booking_required": False,
                "image_url": "https://images.pexels.com/photos/2675266/pexels-photo-2675266.jpeg?auto=compress&cs=tinysrgb&w=300",
                "rating": 4.7,
                "total_reviews": 8934,
                "difficulty_level": "Easy",
                "age_restriction": "All ages",
                "is_featured": True,
                "notes": "Free entry on first Sunday of month"
            },
            {
                "itinerary_id": 1,
                "name": "Seine River Cruise",
                "description": "Evening cruise along the Seine with dinner",
                "category": "transport",
                "subcategory": "Boat Tours",
                "location": "Paris, France",
                "address": "Pont Neuf, 75001 Paris, France",
                "latitude": 48.8566,
                "longitude": 2.3422,
                "time": "20:00",
                "duration_minutes": 90,
                "cost_amount": 18.0,
                "currency": "USD",
                "booking_required": True,
                "max_capacity": 100,
                "image_url": "https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?auto=compress&cs=tinysrgb&w=300",
                "rating": 4.5,
                "total_reviews": 2340,
                "difficulty_level": "Easy",
                "age_restriction": "All ages",
                "is_featured": False,
                "notes": "Dress warmly for evening cruise"
            },
            {
                "itinerary_id": 1,
                "name": "Café de Flore Lunch",
                "description": "Traditional French lunch at historic café",
                "category": "food",
                "subcategory": "Restaurants",
                "location": "Paris, France",
                "address": "172 Boulevard Saint-Germain, 75006 Paris, France",
                "latitude": 48.8534,
                "longitude": 2.3348,
                "time": "13:00",
                "duration_minutes": 90,
                "cost_amount": 45.0,
                "currency": "USD",
                "booking_required": False,
                "image_url": "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=300",
                "rating": 4.3,
                "total_reviews": 1256,
                "difficulty_level": "Easy",
                "age_restriction": "All ages",
                "is_featured": False,
                "notes": "Try the croque monsieur"
            },
            {
                "itinerary_id": 1,
                "name": "Colosseum Tour",
                "description": "Explore the ancient Roman amphitheater",
                "category": "sightseeing",
                "subcategory": "Monuments",
                "location": "Rome, Italy",
                "address": "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
                "latitude": 41.8902,
                "longitude": 12.4922,
                "time": "10:00",
                "duration_minutes": 180,
                "cost_amount": 30.0,
                "currency": "USD",
                "booking_required": True,
                "max_capacity": 30,
                "image_url": "https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=300",
                "rating": 4.6,
                "total_reviews": 5678,
                "difficulty_level": "Moderate",
                "age_restriction": "All ages",
                "is_featured": True,
                "notes": "Book guided tour for better experience"
            }
        ]
        
        for activity_data in sample_activities:
            try:
                # Check if activity already exists
                cursor.execute(
                    "SELECT id FROM activities WHERE name = ? AND location = ?",
                    (activity_data["name"], activity_data["location"])
                )
                existing = cursor.fetchone()
                
                if not existing:
                    cursor.execute("""
                        INSERT INTO activities (
                            itinerary_id, name, description, category, subcategory, location, 
                            address, latitude, longitude, time, duration_minutes, cost_amount, 
                            currency, booking_required, max_capacity, image_url, rating, 
                            total_reviews, difficulty_level, age_restriction, is_featured, notes
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        activity_data["itinerary_id"], activity_data["name"], activity_data["description"],
                        activity_data["category"], activity_data["subcategory"], activity_data["location"],
                        activity_data["address"], activity_data["latitude"], activity_data["longitude"],
                        activity_data["time"], activity_data["duration_minutes"], activity_data["cost_amount"],
                        activity_data["currency"], activity_data["booking_required"], activity_data["max_capacity"],
                        activity_data["image_url"], activity_data["rating"], activity_data["total_reviews"],
                        activity_data["difficulty_level"], activity_data["age_restriction"], activity_data["is_featured"],
                        activity_data["notes"]
                    ))
                    print(f"✓ Added sample activity: {activity_data['name']}")
                else:
                    print(f"⚠ Activity already exists: {activity_data['name']}")
            except Exception as e:
                print(f"✗ Error adding sample activity {activity_data['name']}: {e}")
        
        conn.commit()
        print("\n✅ Database enhancement completed successfully!")
        
    except Exception as e:
        print(f"✗ Database error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    enhance_activity_tables()
