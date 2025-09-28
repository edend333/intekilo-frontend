import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { userService } from '../services/user'
import { uploadService } from '../services/upload.service'
import { ImgUploader } from './ImgUploader.jsx'
import { AvatarCropper } from './AvatarCropper.jsx'
import { UserMsg } from './UserMsg.jsx'
import { setUser } from '../store/user.actions'

export function AvatarLightbox({ isOpen, onClose, user, isOwnProfile = false }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [pendingImageUrl, setPendingImageUrl] = useState(null)
    const [showCropper, setShowCropper] = useState(false)
    const lightboxRef = useRef(null)
    const dispatch = useDispatch()
    const loggedinUser = useSelector(store => store.userModule.user)

    // Focus management and keyboard navigation
    useEffect(() => {
        if (isOpen) {
            const focusableElements = lightboxRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            if (focusableElements?.length > 0) {
                focusableElements[0].focus()
            }
        }
    }, [isOpen])

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Mouse events are now handled by AvatarCropper component

    const handleClose = () => {
        setIsEditing(false)
        setError(null)
        setSuccess(null)
        setPendingImageUrl(null)
        setShowCropper(false)
        onClose()
    }

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleClose()
        }
    }

    const handleEditClick = () => {
        setIsEditing(true)
        setError(null)
        setSuccess(null)
        setPendingImageUrl(null)
        setShowCropper(false)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setError(null)
        setSuccess(null)
        setPendingImageUrl(null)
        setShowCropper(false)
    }

    const handleAvatarUpload = (imgUrl) => {
        if (!imgUrl) {
            setError('אנא בחרי תמונה')
            return
        }

        setError(null)
        setPendingImageUrl(imgUrl)
        setShowCropper(true)
        console.log('📸 Image uploaded successfully, showing cropper:', imgUrl)
    }

    const handleCropComplete = async (croppedDataUrl) => {
        setIsUploading(true)
        setError(null)

        try {
            console.log('💾 Processing cropped avatar...')
            
            // Convert data URL to blob
            const response = await fetch(croppedDataUrl)
            const blob = await response.blob()
            
            // Create form data for upload
            const formData = new FormData()
            formData.append('file', blob, 'avatar.jpg')
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_video_preset')
            
            // Upload cropped image to Cloudinary
            const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxeibnzt3'
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            })
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload cropped image')
            }
            
            const uploadResult = await uploadResponse.json()
            console.log('📸 Cropped image uploaded:', uploadResult.secure_url)
            
            // Update user avatar on server
            const updatedUser = await userService.updateAvatar({
                secureUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id
            })

            console.log('✅ Avatar updated successfully:', updatedUser)

            // Update local store
            dispatch(setUser(updatedUser))

            // Trigger a refresh of the profile page if we're viewing the same user
            if (user && user._id === updatedUser._id) {
                // Force a re-render by updating the user prop
                window.dispatchEvent(new CustomEvent('avatarUpdated', { 
                    detail: { updatedUser } 
                }))
            }

            setSuccess('תמונת הפרופיל עודכנה בהצלחה')
            setIsEditing(false)
            setShowCropper(false)
            setPendingImageUrl(null)
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null)
            }, 3000)

        } catch (error) {
            console.error('❌ Error updating avatar:', error)
            setError('לא ניתן לעדכן כרגע. נסה שוב')
        } finally {
            setIsUploading(false)
        }
    }

    const handleCropperCancel = () => {
        setShowCropper(false)
        setPendingImageUrl(null)
    }

    if (!isOpen) return null

    const avatarUrl = user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
    const displayName = user?.username || user?.fullname || 'משתמש'

    return (
        <>
            <div 
                className="avatar-lightbox-overlay"
                onClick={handleBackdropClick}
                role="dialog"
                aria-modal="true"
                aria-labelledby="avatar-lightbox-title"
            >
                <div className="avatar-lightbox" ref={lightboxRef}>
                    {/* Header with close and edit buttons */}
                    <div className="avatar-lightbox-header">
                        <button 
                            className="avatar-lightbox-close"
                            onClick={handleClose}
                            aria-label="סגירת תצוגת תמונת פרופיל"
                        >
                            ✕
                        </button>
                        {isOwnProfile && !isEditing && (
                            <button 
                                className="avatar-lightbox-edit"
                                onClick={handleEditClick}
                            >
                                עריכת תמונה
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="avatar-lightbox-content">
                        {showCropper ? (
                            <div className="avatar-cropper-mode">
                                <h2 id="avatar-lightbox-title">עריכת תמונת פרופיל</h2>
                                <AvatarCropper
                                    imageUrl={pendingImageUrl}
                                    onCropComplete={handleCropComplete}
                                    onCancel={handleCropperCancel}
                                    isUploading={isUploading}
                                />
                            </div>
                        ) : isEditing ? (
                            <div className="avatar-edit-mode">
                                <h2 id="avatar-lightbox-title">עריכת תמונת פרופיל</h2>
                                <p className="crop-instructions">
                                    בחרי תמונה חדשה לעריכה
                                </p>
                                <div className="avatar-edit-uploader">
                                    <ImgUploader
                                        onUploaded={handleAvatarUpload}
                                        initialImgUrl={avatarUrl}
                                        showPreview={false}
                                        className="avatar-uploader"
                                    />
                                </div>
                                <div className="avatar-edit-actions">
                                    <button 
                                        className="btn-cancel"
                                        onClick={handleCancelEdit}
                                        disabled={isUploading}
                                    >
                                        בטל
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="avatar-view-mode">
                                <h2 id="avatar-lightbox-title">תמונת פרופיל - {displayName}</h2>
                                <div className="avatar-image-container">
                                    {isLoading && (
                                        <div className="avatar-skeleton">
                                            <div className="skeleton-shimmer"></div>
                                        </div>
                                    )}
                                    <img 
                                        src={avatarUrl}
                                        alt="תמונת פרופיל"
                                        className="avatar-image"
                                        onLoad={() => setIsLoading(false)}
                                        onError={() => {
                                            setIsLoading(false)
                                            setError('לא ניתן לטעון את התמונה')
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="avatar-lightbox-message error">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="avatar-lightbox-message success">
                            {success}
                        </div>
                    )}
                </div>
            </div>

            {/* Toast notifications */}
            <UserMsg />
        </>
    )
}
