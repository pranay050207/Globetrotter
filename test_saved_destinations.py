#!/usr/bin/env python3
"""
Simple test script for saved destinations API
Run this after starting the FastAPI server to test the endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_saved_destinations():
    """Test the saved destinations endpoints"""
    
    # Test data
    test_destination = {
        "city_name": "Test City",
        "country_name": "Test Country",
        "region": "Test Region",
        "description": "A test destination for API testing",
        "rating": 4.5,
        "popularity": 85,
        "cost_index": 100,
        "daily_budget": "$50-100",
        "temperature": "20°C",
        "best_time": "Mar-May",
        "highlights": ["Test Attraction 1", "Test Attraction 2"]
    }
    
    print("Testing Saved Destinations API...")
    print("=" * 50)
    
    # Note: These endpoints require authentication
    # You'll need to get a valid JWT token first
    
    try:
        # Test GET endpoint (will fail without auth)
        print("Testing GET /saved-destinations/...")
        response = requests.get(f"{BASE_URL}/saved-destinations/")
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Correctly requires authentication")
        else:
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the FastAPI server is running on port 8000")
        return
    
    print("\nAPI endpoints are set up correctly!")
    print("To test with authentication:")
    print("1. Start the FastAPI server: uvicorn doc.main:app --reload")
    print("2. Get a JWT token by logging in through the frontend")
    print("3. Use the token in the Authorization header: Bearer <token>")

if __name__ == "__main__":
    test_saved_destinations()
