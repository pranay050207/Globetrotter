# Cloudinary Setup for Trip Cover Images

## Prerequisites
- Cloudinary account
- Access to Cloudinary Dashboard

## Setup Steps

### 1. Create Upload Preset
1. Log into your Cloudinary Dashboard
2. Go to **Settings** → **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `trip_covers`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `trip_covers` (optional, for organization)
   - **Allowed formats**: `jpg, png, jpeg, webp`
   - **Max file size**: `10MB`
   - **Transformation**: You can add transformations like:
     - **Quality**: `auto:good`
     - **Format**: `auto`

### 2. Environment Variables
Make sure these are set in your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Test the Setup
After setting up, you can test by:
1. Starting your backend server
2. Creating a trip with a cover image
3. Checking Cloudinary dashboard to see uploaded images

## Features
- **Drag & Drop**: Users can drag images directly onto the upload area
- **File Selection**: Click to browse and select images from device
- **Preview**: Shows image preview before upload
- **Validation**: Checks file type and size (max 10MB)
- **Error Handling**: Displays user-friendly error messages
- **Cloud Storage**: Images are stored in Cloudinary with organized folder structure
