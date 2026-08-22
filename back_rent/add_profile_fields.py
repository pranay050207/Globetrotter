#!/usr/bin/env python3
"""
Script to add missing profile fields to the users table
"""

import sqlite3
import os

def add_profile_fields():
    """Add missing profile fields to the users table"""
    
    # Connect to the database
    db_path = "globe_trotter.db"
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Define the missing columns to add
        missing_columns = [
            ("phone", "VARCHAR(50)"),
            ("bio", "TEXT"),
            ("location", "VARCHAR(255)"),
            ("timezone", "VARCHAR(100) DEFAULT 'Asia/Kolkata'"),
            ("currency", "VARCHAR(10) DEFAULT 'INR'"),
            ("language", "VARCHAR(10) DEFAULT 'en'"),
            ("public_profile", "BOOLEAN DEFAULT 0"),
            ("two_factor_auth", "BOOLEAN DEFAULT 0")
        ]
        
        # Add each missing column
        for column_name, column_type in missing_columns:
            if column_name not in columns:
                print(f"Adding column: {column_name}")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
            else:
                print(f"Column {column_name} already exists")
        
        # Commit the changes
        conn.commit()
        print("Profile fields added successfully!")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(users)")
        new_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns: {new_columns}")
        
        # Show sample data
        cursor.execute("SELECT id, full_name, email, phone, bio, location FROM users LIMIT 3")
        users = cursor.fetchall()
        print("\nSample user data:")
        for user in users:
            print(f"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Phone: {user[3]}, Bio: {user[4]}, Location: {user[5]}")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_profile_fields()
