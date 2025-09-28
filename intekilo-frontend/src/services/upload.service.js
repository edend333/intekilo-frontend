export const uploadService = {
    uploadImg,
    uploadFile,
    validateVideo,
    uploadVideo
}


async function uploadImg(ev) {
    //* Using environment variables
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxeibnzt3'
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_video_preset'
    
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const FORM_DATA = new FormData()
    //* Building the request body
    FORM_DATA.append('file', ev.target.files[0])
    FORM_DATA.append('upload_preset', UPLOAD_PRESET)
    //* Sending a post method request to Cloudinary API
    try {
        const res = await fetch(UPLOAD_URL, { method: 'POST', body: FORM_DATA, })
        
        // Check if the response is successful
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error('Cloudinary image upload failed:', {
                status: res.status,
                statusText: res.statusText,
                error: errorData
            })
            
            // Provide user-friendly error messages
            let errorMessage = 'שגיאה בהעלאת התמונה'
            if (res.status === 400) {
                if (errorData.error?.message?.includes('preset')) {
                    errorMessage = 'הגדרות העלאה לא תקינות. אנא פנה למנהל המערכת'
                } else if (errorData.error?.message?.includes('format')) {
                    errorMessage = 'פורמט התמונה לא נתמך'
                } else if (errorData.error?.message?.includes('size')) {
                    errorMessage = 'התמונה גדולה מדי'
                } else {
                    errorMessage = 'התמונה לא תקינה. אנא נסה/י תמונה אחרת'
                }
            } else if (res.status === 413) {
                errorMessage = 'התמונה גדולה מדי'
            } else if (res.status >= 500) {
                errorMessage = 'שגיאה בשרת. אנא נסה/י שוב מאוחר יותר'
            }
            
            throw new Error(errorMessage)
        }
        
        const imgData = await res.json()
        
        // Validate that we got the required fields
        if (!imgData.secure_url) {
            console.error('Cloudinary response missing secure_url:', imgData)
            throw new Error('העלאה נכשלה - נתונים חסרים מהשרת')
        }
        
        return imgData
    } catch (err) {
        console.error('Image upload error:', err)
        // Re-throw with user-friendly message if it's not already a user-friendly error
        if (err.message && !err.message.includes('אנא')) {
            throw new Error('שגיאה בהעלאת התמונה. אנא נסה/י שוב')
        }
        throw err
    }
}

// Function to upload file directly (not from event)
async function uploadFile(file) {
    //* Using environment variables
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxeibnzt3'
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_video_preset'
    
    // Determine upload URL based on file type
    const isVideo = file.type.startsWith('video/')
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`
    
    const FORM_DATA = new FormData()
    //* Building the request body
    FORM_DATA.append('file', file)
    FORM_DATA.append('upload_preset', UPLOAD_PRESET)
    
    //* Sending a post method request to Cloudinary API
    try {
        const res = await fetch(UPLOAD_URL, { method: 'POST', body: FORM_DATA })
        
        // Check if the response is successful
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error('Cloudinary upload failed:', {
                status: res.status,
                statusText: res.statusText,
                error: errorData,
                fileType: file.type,
                fileSize: file.size
            })
            
            // Provide user-friendly error messages
            let errorMessage = 'שגיאה בהעלאת הקובץ'
            if (res.status === 400) {
                if (errorData.error?.message?.includes('preset')) {
                    errorMessage = 'הגדרות העלאה לא תקינות. אנא פנה למנהל המערכת'
                } else if (errorData.error?.message?.includes('format')) {
                    errorMessage = 'פורמט הקובץ לא נתמך'
                } else if (errorData.error?.message?.includes('size')) {
                    errorMessage = 'הקובץ גדול מדי'
                } else {
                    errorMessage = 'הקובץ לא תקין. אנא נסה/י קובץ אחר'
                }
            } else if (res.status === 413) {
                errorMessage = 'הקובץ גדול מדי'
            } else if (res.status >= 500) {
                errorMessage = 'שגיאה בשרת. אנא נסה/י שוב מאוחר יותר'
            }
            
            throw new Error(errorMessage)
        }
        
        const data = await res.json()
        
        // Validate that we got the required fields
        if (!data.secure_url) {
            console.error('Cloudinary response missing secure_url:', data)
            throw new Error('העלאה נכשלה - נתונים חסרים מהשרת')
        }
        
        return data
    } catch (err) {
        console.error('Upload error:', err)
        // Re-throw with user-friendly message if it's not already a user-friendly error
        if (err.message && !err.message.includes('אנא')) {
            throw new Error('שגיאה בהעלאת הקובץ. אנא נסה/י שוב')
        }
        throw err
    }
}

// Validate video file before upload
function validateVideo(file) {
    const errors = []
    
    // Check file type
    const supportedTypes = ['video/mp4', 'video/webm']
    if (!supportedTypes.includes(file.type)) {
        errors.push('סוג קובץ לא נתמך. אנא בחר/י קובץ MP4 או WebM')
    }
    
    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB in bytes
    if (file.size > maxSize) {
        errors.push('הקובץ גדול מדי. אנא בחר/י קובץ קטן מ-100MB')
    }
    
    return {
        isValid: errors.length === 0,
        errors
    }
}

// Upload video with validation and duration check
async function uploadVideo(file) {
    // Validate file first
    const validation = validateVideo(file)
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
    }
    
    //* Using environment variables
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxeibnzt3'
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_video_preset'
    
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
    
    const FORM_DATA = new FormData()
    FORM_DATA.append('file', file)
    FORM_DATA.append('upload_preset', UPLOAD_PRESET)
    
    // Add video-specific parameters
    FORM_DATA.append('resource_type', 'video')
    // Remove eager transformation to avoid h_auto error
    // FORM_DATA.append('eager', 'w_400,h_auto,c_fill') // This causes "Invalid height: auto" error
    
    try {
        const res = await fetch(UPLOAD_URL, { method: 'POST', body: FORM_DATA })
        
        // Check if the response is successful
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error('Cloudinary upload failed:', {
                status: res.status,
                statusText: res.statusText,
                error: errorData
            })
            
            // Provide user-friendly error messages based on status code
            let errorMessage = 'שגיאה בהעלאת הווידיאו'
            if (res.status === 400) {
                if (errorData.error?.message?.includes('preset')) {
                    errorMessage = 'הגדרות העלאה לא תקינות. אנא פנה למנהל המערכת'
                } else if (errorData.error?.message?.includes('format')) {
                    errorMessage = 'פורמט הקובץ לא נתמך. אנא בחר/י קובץ MP4 או WebM'
                } else if (errorData.error?.message?.includes('size')) {
                    errorMessage = 'הקובץ גדול מדי. אנא בחר/י קובץ קטן מ-100MB'
                } else {
                    errorMessage = 'הקובץ לא תקין. אנא נסה/י קובץ אחר'
                }
            } else if (res.status === 413) {
                errorMessage = 'הקובץ גדול מדי. אנא בחר/י קובץ קטן מ-100MB'
            } else if (res.status >= 500) {
                errorMessage = 'שגיאה בשרת. אנא נסה/י שוב מאוחר יותר'
            }
            
            throw new Error(errorMessage)
        }
        
        const data = await res.json()
        
        // Validate that we got the required fields
        if (!data.secure_url) {
            console.error('Cloudinary response missing secure_url:', data)
            throw new Error('העלאה נכשלה - נתונים חסרים מהשרת')
        }
        
        // Check video duration (60 seconds limit)
        if (data.duration && data.duration > 60) {
            throw new Error('הווידיאו ארוך מדי. אנא בחר/י וידיאו קצר מ-60 שניות')
        }
        
        // Generate poster URL safely (no eager transformation)
        let posterUrl = data.secure_url
        if (data.secure_url) {
            // Create a poster URL by adding transformation to get first frame
            const baseUrl = data.secure_url.replace(/\.(mp4|webm)$/, '')
            posterUrl = `${baseUrl}.jpg`
        }
        
        return {
            videoUrl: data.secure_url,
            posterUrl: posterUrl || data.secure_url, // Fallback to video URL if no poster
            duration: data.duration || 0,
            width: data.width || 0,
            height: data.height || 0,
            format: data.format || 'mp4',
            publicId: data.public_id || ''
        }
    } catch (err) {
        console.error('Video upload error:', err)
        // Re-throw with user-friendly message if it's not already a user-friendly error
        if (err.message && !err.message.includes('אנא')) {
            throw new Error('שגיאה בהעלאת הווידיאו. אנא נסה/י שוב')
        }
        throw err
    }
}