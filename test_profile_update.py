#!/usr/bin/env python3
"""
Test script to verify profile update functionality
"""

import requests
import json

def test_profile_update():
    """Test the profile update endpoint"""
    
    # Test data
    test_data = {
        "full_name": "Updated Name",
        "phone": "9876543210",
        "bio": "This is a test bio",
        "location": "Test Location",
        "timezone": "America/New_York",
        "currency": "USD",
        "language": "en",
        "public_profile": True,
        "two_factor_auth": False
    }
    
    # First, try to login to get a token
    login_data = {
        "username": "admin@demo.com",  # Use admin user
        "password": "password123"  # Admin password from auth.py
    }
    
    try:
        # Try to login
        login_response = requests.post(
            "http://localhost:8000/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("access_token")
            print(f"Login successful, got token: {token[:20]}...")
            
            # Now test profile update
            headers = {
                "Authorization": f"Bearer {token}"
                # Remove Content-Type header to let requests set it for FormData
            }
            
            update_response = requests.put(
                "http://localhost:8000/api/auth/profile",
                data=test_data,  # Use data instead of json for FormData
                headers=headers
            )
            
            print(f"Profile update status: {update_response.status_code}")
            print(f"Profile update response: {update_response.text}")
            
            if update_response.status_code == 200:
                updated_profile = update_response.json()
                print(f"Updated profile: {json.dumps(updated_profile, indent=2)}")
                
                # Test getting the profile to verify it was saved
                get_response = requests.get(
                    "http://localhost:8000/api/auth/profile",
                    headers=headers
                )
                
                print(f"Get profile status: {get_response.status_code}")
                if get_response.status_code == 200:
                    current_profile = get_response.json()
                    print(f"Current profile: {json.dumps(current_profile, indent=2)}")
                    
                    # Verify the changes were saved
                    if (current_profile.get("full_name") == test_data["full_name"] and
                        current_profile.get("phone") == test_data["phone"] and
                        current_profile.get("bio") == test_data["bio"]):
                        print("✅ Profile update test PASSED!")
                    else:
                        print("❌ Profile update test FAILED - changes not saved!")
                else:
                    print(f"❌ Failed to get profile: {get_response.text}")
            else:
                print(f"❌ Profile update failed: {update_response.text}")
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    test_profile_update()
