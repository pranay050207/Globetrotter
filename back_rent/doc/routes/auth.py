from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional
from doc.database import get_db
from doc.models.user import User
from doc.utils.security import hash_password, verify_password, get_current_user
from doc.schemas.user_schema import UserOut
# from doc.utils.otp_handler import generate_otp
from doc.utils.cloudinary_handler import upload_avatar
from doc.utils.jwt_handler import create_access_token
from doc.config import settings
import traceback

router = APIRouter()

@router.get("/profile", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile information"""
    return current_user

@router.put("/profile", response_model=UserOut)
async def update_user_profile(
    full_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    currency: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    public_profile: Optional[bool] = Form(None),
    two_factor_auth: Optional[bool] = Form(None),
    avatar: UploadFile = File(None),
    remove_avatar: Optional[bool] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile information"""
    try:
        print(f"Profile update request received for user {current_user.id}")
        print(f"Received data: full_name={full_name}, phone={phone}, bio={bio}, location={location}")
        print(f"timezone={timezone}, currency={currency}, language={language}")
        print(f"public_profile={public_profile}, two_factor_auth={two_factor_auth}")
        print(f"remove_avatar={remove_avatar}, avatar={avatar}")
        
        # Get the user from the current session using the ID from current_user
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"Found user in database: {user.full_name}")
        
        # Track if any changes were made
        changes_made = False
        
        # Update fields if provided
        if full_name is not None and full_name != user.full_name:
            user.full_name = full_name
            changes_made = True
            print(f"Updated full_name to: {full_name}")
        if phone is not None and phone != user.phone:
            user.phone = phone
            changes_made = True
            print(f"Updated phone to: {phone}")
        if bio is not None and bio != user.bio:
            user.bio = bio
            changes_made = True
            print(f"Updated bio to: {bio}")
        if location is not None and location != user.location:
            user.location = location
            changes_made = True
            print(f"Updated location to: {location}")
        if timezone is not None and timezone != user.timezone:
            user.timezone = timezone
            changes_made = True
            print(f"Updated timezone to: {timezone}")
        if currency is not None and currency != user.currency:
            user.currency = currency
            changes_made = True
            print(f"Updated currency to: {currency}")
        if language is not None and language != user.language:
            user.language = language
            changes_made = True
            print(f"Updated language to: {language}")
        if public_profile is not None:
            new_public_profile = str(public_profile).lower() == 'true'
            if new_public_profile != user.public_profile:
                user.public_profile = new_public_profile
                changes_made = True
                print(f"Updated public_profile to: {user.public_profile}")
        if two_factor_auth is not None:
            new_two_factor_auth = str(two_factor_auth).lower() == 'true'
            if new_two_factor_auth != user.two_factor_auth:
                user.two_factor_auth = new_two_factor_auth
                changes_made = True
                print(f"Updated two_factor_auth to: {user.two_factor_auth}")
            
        # Handle avatar removal if requested
        if remove_avatar and str(remove_avatar).lower() == 'true' and user.avatar is not None:
            user.avatar = None
            changes_made = True
            print("Removed avatar")
            
        # Handle avatar upload if provided
        elif avatar:
            try:
                avatar_url = await upload_avatar(avatar)
                if avatar_url != user.avatar:
                    user.avatar = avatar_url
                    changes_made = True
                    print(f"Updated avatar to: {avatar_url}")
            except Exception as e:
                print(f"Avatar upload failed: {e}")
                # Continue without failing the update
        
        if changes_made:
            # Explicitly add the user to the session and commit
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Profile updated successfully for user {user.id}: {user.full_name}")
        else:
            print("No changes detected, skipping commit")
        
        print(f"Final user data: {user.full_name}, {user.phone}, {user.bio}, {user.location}")
        return user
        
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.post("/signup")
async def signup(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("user"),
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Create admin user if it doesn't exist
    admin_user = db.query(User).filter(User.email == "admin@demo.com").first()
    if not admin_user:
        admin_user = User(
            full_name="Admin",
            email="admin@demo.com",
            password=hash_password("password123"),
            role="admin",
            is_verified=True
        )
        db.add(admin_user)
        db.commit()

    try:
        # Check if user exists
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="Email already exists")

        # Upload avatar if provided and cloudinary configured
        avatar_url = None
        if avatar: # Changed from 'avatar' to 'avatar'
            try:
                avatar_url = await upload_avatar(avatar)
            except Exception as e:
                # Log error but don't fail signup
                print(f"Avatar upload failed: {e}")
                avatar_url = None

        # Hash password & (OTP disabled)
        hashed_pw = hash_password(password)
        # otp = generate_otp()

        # In local/dev, auto-verify to simplify workflow
        is_verified = settings.ENVIRONMENT.lower() == "local"

        # Create new user
        user = User(
            full_name=full_name,
            email=email,
            password=hashed_pw,
            role=role,
            avatar=avatar_url,
            is_verified=is_verified,
            otp=None
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "User created successfully",
            "user_id": user.id,
            "avatar_url": avatar_url
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# @router.post("/verify-otp")
# def verify_otp(
#     email: str = Form(...),
#     otp: str = Form(...),
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.email == email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     if user.otp != otp:
#         raise HTTPException(status_code=400, detail="Invalid OTP")
#
#     user.is_verified = True
#     user.otp = None
#     db.commit()
#
#     return {"message": "Account verified successfully"}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.email == form_data.username).first()

        if not user or not verify_password(form_data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # In local/dev, skip verification enforcement
        if not user.is_verified and settings.ENVIRONMENT.lower() != "local":
            raise HTTPException(status_code=403, detail="Account not verified")

        token = create_access_token({"email": user.email, "role": user.role})

        return {"access_token": token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@router.delete("/delete-account")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete the current user's account and all associated data"""
    try:
        # Get user ID before deletion for cleanup
        user_id = current_user.id
        user_email = current_user.email
        
        # Delete the user (this will cascade to related data if foreign key constraints are set up)
        db.delete(current_user)
        db.commit()
        
        return {"message": f"Account for {user_email} has been permanently deleted"}
        
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
