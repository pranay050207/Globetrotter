#!/usr/bin/env python3
"""
Script to add sample cities to the database for testing statistics
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from doc.database import SessionLocal, engine
from doc.models import City, User, Trip
from sqlalchemy import text

def add_sample_data():
    """Add sample cities, users, and trips to the database"""
    db = SessionLocal()
    
    try:
        # Check if we already have data
        existing_cities = db.query(City).count()
        existing_users = db.query(User).count()
        existing_trips = db.query(Trip).count()
        
        print(f"Current database state:")
        print(f"- Cities: {existing_cities}")
        print(f"- Users: {existing_users}")
        print(f"- Trips: {existing_trips}")
        
        if existing_cities == 0:
            # Add sample cities from different countries
            sample_cities = [
                {"name": "New York", "country": "United States", "description": "The Big Apple"},
                {"name": "London", "country": "United Kingdom", "description": "Historic capital"},
                {"name": "Paris", "country": "France", "description": "City of Light"},
                {"name": "Tokyo", "country": "Japan", "description": "Modern metropolis"},
                {"name": "Sydney", "country": "Australia", "description": "Harbor city"},
                {"name": "Toronto", "country": "Canada", "description": "Maple leaf city"},
                {"name": "Berlin", "country": "Germany", "description": "Cultural hub"},
                {"name": "Rome", "country": "Italy", "description": "Eternal city"},
                {"name": "Barcelona", "country": "Spain", "description": "Mediterranean gem"},
                {"name": "Amsterdam", "country": "Netherlands", "description": "Canal city"},
                {"name": "Singapore", "country": "Singapore", "description": "Lion city"},
                {"name": "Dubai", "country": "United Arab Emirates", "description": "Desert metropolis"},
                {"name": "Mumbai", "country": "India", "description": "Financial capital"},
                {"name": "Cape Town", "country": "South Africa", "description": "Mother city"},
                {"name": "Rio de Janeiro", "country": "Brazil", "description": "Marvelous city"}
            ]
            
            for city_data in sample_cities:
                city = City(**city_data)
                db.add(city)
            
            db.commit()
            print(f"Added {len(sample_cities)} sample cities")
        
        # Check final counts
        final_cities = db.query(City).count()
        final_users = db.query(User).count()
        final_trips = db.query(Trip).count()
        
        # Count unique countries
        unique_countries = db.execute(text("SELECT COUNT(DISTINCT country) FROM cities")).scalar()
        
        print(f"\nFinal database state:")
        print(f"- Cities: {final_cities}")
        print(f"- Users: {final_users}")
        print(f"- Trips: {final_trips}")
        print(f"- Unique Countries: {unique_countries}")
        
        if unique_countries > 0:
            print("\nCountries in database:")
            countries = db.execute(text("SELECT DISTINCT country FROM cities ORDER BY country")).fetchall()
            for country in countries:
                print(f"  - {country[0]}")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
