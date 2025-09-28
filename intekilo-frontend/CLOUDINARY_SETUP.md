# Cloudinary Setup Instructions

## Current Issue
The video upload is failing with 400 Bad Request because the current preset `ml_default` may not be configured for video uploads.

## Solution: Create/Update Upload Preset

### 1. Login to Cloudinary Dashboard
- Go to https://cloudinary.com/console
- Login with your account

### 2. Navigate to Upload Settings
- Go to Settings → Upload
- Find "Upload presets" section

### 3. Create New Preset for Videos
- Click "Add upload preset"
- Name: `ml_video_preset` (or update existing `ml_default`)

### 4. Configure Preset Settings
- **Signing Mode**: Unsigned (for client-side uploads)
- **Resource Type**: Auto (allows both images and videos)
- **Allowed Formats**: 
  - Images: jpg, jpeg, png, gif, webp
  - Videos: mp4, webm, mov, avi
- **Max File Size**: 100MB (104857600 bytes)
- **Max Video Duration**: 60 seconds
- **Quality**: Auto
- **Transformation**: 
  - For videos: `q_auto,f_auto`
  - For images: `q_auto,f_auto`

### ⚠️ Important: Eager Transformations
**DO NOT** add eager transformations with `h_auto` or `height:auto` as this causes:
```
"Eager Invalid height in transformation: auto"
```

**If you need eager transformations, use specific dimensions:**
- ✅ `w_400,h_300,c_fill` (valid)
- ❌ `w_400,h_auto,c_fill` (invalid)

**Current fix**: The client code has been updated to remove eager transformations entirely.

### 5. Update Environment Variables
Create `.env` file in `intekilo-frontend/`:
```
VITE_CLOUDINARY_CLOUD_NAME=dxeibnzt3
VITE_CLOUDINARY_UPLOAD_PRESET=ml_video_preset
```

### 6. Alternative: Update Existing Preset
If you want to keep using `ml_default`:
- Edit the existing preset
- Change Resource Type to "Auto"
- Add video formats to allowed formats
- Set max file size to 100MB

## Testing
After updating the preset:
1. Try uploading a small MP4 file (< 10MB, < 30 seconds)
2. Check browser console for any errors
3. Verify the video appears in Cloudinary media library

## Common Issues
- **400 Bad Request**: Usually means preset doesn't allow video format
- **413 Payload Too Large**: File size exceeds preset limit
- **403 Forbidden**: Preset is signed but being used unsigned
- **Missing secure_url**: Preset configuration issue

## Debug Steps
1. Check Cloudinary dashboard for upload logs
2. Verify preset settings match requirements
3. Test with different file formats/sizes
4. Check browser network tab for detailed error responses
