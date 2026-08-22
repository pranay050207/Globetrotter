#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine, text
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from doc.database import engine

def check_itineraries():
    print("Checking itineraries in database...")
    try:
        with engine.connect() as conn:
            # Check all itineraries
            result = conn.execute(text("SELECT id, trip_id, date, city FROM itineraries ORDER BY id"))
            itineraries = result.fetchall()
            
            if not itineraries:
                print("No itineraries found in database")
            else:
                print(f"Found {len(itineraries)} itineraries:")
                for itinerary in itineraries:
                    print(f"  ID: {itinerary[0]}, Trip ID: {itinerary[1]}, Date: {itinerary[2]}, City: {itinerary[3]}")
            
            # Check trips
            print("\nChecking trips...")
            result = conn.execute(text("SELECT id, title, user_id FROM trips ORDER BY id"))
            trips = result.fetchall()
            
            if not trips:
                print("No trips found in database")
            else:
                print(f"Found {len(trips)} trips:")
                for trip in trips:
                    print(f"  ID: {trip[0]}, Title: {trip[1]}, User ID: {trip[2]}")
            
            # Check users
            print("\nChecking users...")
            result = conn.execute(text("SELECT id, email FROM users ORDER BY id"))
            users = result.fetchall()
            
            if not users:
                print("No users found in database")
            else:
                print(f"Found {len(users)} users:")
                for user in users:
                    print(f"  ID: {user[0]}, Email: {user[1]}")
                    
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_itineraries()
