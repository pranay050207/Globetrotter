import cloudinary
import cloudinary.uploader
from doc.config import settings
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_avatar(file_like):
    # Read file bytes from UploadFile
    file_bytes = await file_like.read()  # ✅ Await here

    # Upload to Cloudinary (pass raw bytes with resource_type='auto')
    upload_result = cloudinary.uploader.unsigned_upload(
        file_bytes,
        upload_preset="avatars",
        resource_type="auto"
    )

    return upload_result.get("secure_url")

async def upload_cover_image(file_like):
    """
    Upload a trip cover image to Cloudinary
    """
    # Read file bytes from UploadFile
    file_bytes = await file_like.read()
    
    # Upload to Cloudinary with trip cover image preset
    upload_result = cloudinary.uploader.unsigned_upload(
        file_bytes,
        upload_preset="cover-image",  # You'll need to create this preset in Cloudinary
        resource_type="auto",
        folder="cover-image"  # Organize images in a folder
    )
    
    return upload_result.get("secure_url")
