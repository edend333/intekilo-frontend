# Cloudinary Eager Transformation Fix

## Problem
Video upload fails with 400 Bad Request:
```json
{
  "error": {
    "message": "Eager Invalid height in transformation: auto"
  }
}
```

## Root Cause
The `eager` parameter in upload service contains `h_auto` which is invalid for Cloudinary transformations.

## Solution Applied

### 1. **Removed Eager Transformation**
```javascript
// Before (causing error):
FORM_DATA.append('eager', 'w_400,h_auto,c_fill')

// After (fixed):
// FORM_DATA.append('eager', 'w_400,h_auto,c_fill') // Commented out
```

### 2. **Updated Poster URL Generation**
```javascript
// Before (depends on eager):
let posterUrl = data.eager?.[0]?.secure_url

// After (simple replacement):
let posterUrl = data.secure_url.replace(/\.(mp4|webm)$/, '.jpg')
```

### 3. **Cloudinary Preset Check**
- Verify preset doesn't have eager transformations with `h_auto`
- Use specific dimensions if eager is needed: `w_400,h_300,c_fill`
- Or remove eager transformations entirely (current approach)

## Files Modified
- `src/services/upload.service.js` - Removed eager parameter
- `CLOUDINARY_SETUP.md` - Added eager transformation warnings

## Testing
1. Upload a video file
2. Should return 200 OK with `secure_url`
3. No more "Eager Invalid height" error
4. Video should appear in Cloudinary media library

## Expected Result
```json
{
  "secure_url": "https://res.cloudinary.com/.../video/upload/v1234567890/sample.mp4",
  "public_id": "sample",
  "duration": 15.5,
  "width": 1920,
  "height": 1080,
  "format": "mp4"
}
```

## If Still Failing
1. Check Cloudinary preset settings
2. Remove any eager transformations from preset
3. Verify preset allows video uploads
4. Check file format and size limits
