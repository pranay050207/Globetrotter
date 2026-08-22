#!/usr/bin/env python3

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from doc.database import engine, SessionLocal
from doc.models.activity import Activity

def test_database():
    print("Testing database connection...")
    
    try:
        # Test basic connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✓ Database connection successful")
            
            # Check if activities table exists
            result = conn.execute(text("SHOW TABLES LIKE 'activities'"))
            tables = result.fetchall()
            if tables:
                print("✓ Activities table exists")
            else:
                print("✗ Activities table does not exist")
                
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False
    
    try:
        # Test ORM connection
        db = SessionLocal()
        activities = db.query(Activity).all()
        print(f"✓ Found {len(activities)} activities in database")
        
        # Check for featured activities
        featured_activities = db.query(Activity).filter(Activity.is_featured == True).all()
        print(f"✓ Found {len(featured_activities)} featured activities")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"✗ ORM query failed: {e}")
        return False

if __name__ == "__main__":
    test_database()
