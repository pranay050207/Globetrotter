from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from doc.utils.security import get_current_user
from doc.utils.cloudinary_handler import upload_cover_image

router = APIRouter(prefix="/upload", tags=["Upload"])

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
        # Upload to Cloudinary
        image_url = await upload_cover_image(file)
        
        return {"url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
