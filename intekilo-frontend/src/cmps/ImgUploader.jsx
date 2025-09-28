import { useState } from 'react'
import { uploadService } from '../services/upload.service'

export function ImgUploader({ onUploaded, initialImgUrl = null, showPreview = true, className = '' }) {
    const [imgData, setImgData] = useState({
        imgUrl: initialImgUrl,
        height: 500,
        width: 500,
    })
    
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState(null)

    async function uploadImg(ev) {
        const file = ev.target.files[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('אנא בחרי קובץ תמונה בלבד')
            return
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('הקובץ גדול מדי. אנא בחרי תמונה קטנה מ-10MB')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const { secure_url, height, width } = await uploadService.uploadImg(ev)
            // Image uploaded successfully
            setImgData({ imgUrl: secure_url, width, height })
            onUploaded && onUploaded(secure_url)
        } catch (err) {
            console.error('Upload error:', err)
            setError('שגיאה בהעלאת התמונה. אנא נסי שוב.')
        } finally {
            setIsUploading(false)
        }
    }

    function getUploadLabel() {
        if (isUploading) return 'מעלה תמונה...'
        if (imgData.imgUrl) return 'החלפי תמונה'
        return 'העלי תמונה'
    }

    return (
        <div className={`img-uploader ${className}`}>
            {showPreview && imgData.imgUrl && (
                <div className="upload-preview full-preview">
                    <img src={imgData.imgUrl} alt="Preview" className="preview-image" />
                    <div className="preview-overlay">
                        <span className="preview-text">תמונה נבחרה</span>
                    </div>
                </div>
            )}
            
            <div className="upload-controls">
                <label htmlFor="imgUpload" className="upload-label">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">{getUploadLabel()}</span>
                </label>
                <input 
                    type="file" 
                    onChange={uploadImg} 
                    accept="image/*" 
                    id="imgUpload" 
                    className="upload-input"
                    disabled={isUploading}
                />
            </div>

            {error && (
                <div className="upload-error">
                    {error}
                </div>
            )}

            {isUploading && (
                <div className="upload-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            )}
        </div>
    )
}