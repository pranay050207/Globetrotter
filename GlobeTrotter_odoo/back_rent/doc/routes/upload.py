from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from doc.utils.security import get_current_user
from doc.utils.cloudinary_handler import upload_cover_image

router = APIRouter(prefix="/upload", tags=["Upload"])
LOCAL_UPLOAD_DIR = Path(__file__).resolve().parent.parent / "static" / "uploads"

@router.post("/cover-image")
async def upload_trip_cover_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Upload a trip cover image to Cloudinary
    """
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size must be less than 10MB")
    
    try:
        # Prefer Cloudinary when configured, but keep local development usable
        # when credentials or the upload preset are unavailable.
        try:
            image_url = await upload_cover_image(file)
            if image_url:
                return {"url": image_url}
        except Exception as cloudinary_error:
            print(f"Cloudinary upload failed, using local storage: {cloudinary_error}")

        LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        extension = Path(file.filename or "upload.jpg").suffix.lower() or ".jpg"
        filename = f"{uuid4().hex}{extension}"
        destination = LOCAL_UPLOAD_DIR / filename
        await file.seek(0)
        file_bytes = await file.read()
        destination.write_bytes(file_bytes)
        return {"url": f"/api/uploads/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
