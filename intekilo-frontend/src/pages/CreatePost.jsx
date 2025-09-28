import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { uploadService } from '../services/upload.service'
import { addPost } from '../store/posts/post.actions'
import { setUser } from '../store/user.actions'
import { VideoPlayer } from '../cmps/VideoPlayer'
import TextInputWithEmoji from '../cmps/TextInputWithEmoji'

export function CreatePost() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const loggedinUser = useSelector(store => store.userModule.user)
    
    const [selectedFiles, setSelectedFiles] = useState([])
    const [dragActive, setDragActive] = useState(false)
    const [currentStep, setCurrentStep] = useState('select') // 'select', 'share'
    const [postText, setPostText] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isPosting, setIsPosting] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [uploadedVideoData, setUploadedVideoData] = useState(null)

    // Listen for avatar updates to refresh user data
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { updatedUser } = event.detail
            if (updatedUser && loggedinUser && updatedUser._id === loggedinUser._id) {
                console.log('🔄 CreatePost: Avatar updated for logged-in user, refreshing user data')
                // Update the loggedinUser in Redux store
                dispatch(setUser(updatedUser))
            }
        }

        window.addEventListener('avatarUpdated', handleAvatarUpdate)
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate)
        }
    }, [loggedinUser?._id, dispatch])

    const handleFileSelect = (files) => {
        const fileArray = Array.from(files)
        
        // Validate each file
        const validFiles = []
        const errors = []
        
        fileArray.forEach(file => {
            if (file.type.startsWith('video/')) {
                const validation = uploadService.validateVideo(file)
                if (validation.isValid) {
                    validFiles.push(file)
                } else {
                    errors.push(...validation.errors)
                }
            } else if (file.type.startsWith('image/')) {
                validFiles.push(file)
            } else {
                errors.push(`סוג קובץ לא נתמך: ${file.name}`)
            }
        })
        
        if (errors.length > 0) {
            setUploadError(errors.join(', '))
            setTimeout(() => setUploadError(''), 5000) // Clear error after 5 seconds
        }
        
        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles])
            setUploadError('')
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files)
        }
    }

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files)
        }
    }

    const handleNext = () => {
        if (selectedFiles.length > 0) {
            setCurrentStep('share')
        }
    }

    const handleBack = () => {
        setCurrentStep('select')
    }

    const handleShare = async () => {
        if (!loggedinUser) {
            alert('You must be logged in to create a post')
            return
        }

        if (selectedFiles.length === 0) {
            alert('Please select at least one file')
            return
        }

        try {
            setIsPosting(true)
            setIsUploading(true)
            setUploadError('')

            const file = selectedFiles[0]
            let uploadResult

            // Upload based on file type
            if (file.type.startsWith('video/')) {
                uploadResult = await uploadService.uploadVideo(file)
                setUploadedVideoData(uploadResult)
            } else {
                uploadResult = await uploadService.uploadFile(file)
            }
            
            setIsUploading(false)

            // Create post object according to existing schema
            const newPost = {
                txt: postText || '',
                owner: {
                    _id: loggedinUser._id,
                    username: loggedinUser.username,
                    fullname: loggedinUser.fullname,
                    imgUrl: loggedinUser.imgUrl
                },
                loc: null,
                likedBy: [],
                tags: [],
                msgs: []
            }

            // Add media-specific fields
            if (file.type.startsWith('video/')) {
                newPost.videoUrl = uploadResult.videoUrl
                newPost.posterUrl = uploadResult.posterUrl
                newPost.duration = uploadResult.duration
                newPost.width = uploadResult.width
                newPost.height = uploadResult.height
                newPost.format = uploadResult.format
                newPost.type = 'video'
            } else {
                newPost.imgUrl = uploadResult.secure_url
                newPost.type = 'image'
            }

            // Save post to server and store
            await dispatch(addPost(newPost))
            
            // Close modal and navigate back to feed
            navigate('/')
            
        } catch (error) {
            console.error('Failed to create post:', error)
            
            // Provide more specific error messages
            let errorMessage = error.message || 'שגיאה ביצירת הפוסט. אנא נסה/י שוב.'
            
            // Handle specific error types
            if (error.message?.includes('preset')) {
                errorMessage = 'הגדרות העלאה לא תקינות. אנא פנה למנהל המערכת.'
            } else if (error.message?.includes('format')) {
                errorMessage = 'פורמט הקובץ לא נתמך. אנא בחר/י קובץ אחר.'
            } else if (error.message?.includes('size') || error.message?.includes('גדול')) {
                errorMessage = 'הקובץ גדול מדי. אנא בחר/י קובץ קטן יותר.'
            } else if (error.message?.includes('ארוך')) {
                errorMessage = 'הווידיאו ארוך מדי. אנא בחר/י וידיאו קצר מ-60 שניות.'
            } else if (error.message?.includes('רשת') || error.message?.includes('network')) {
                errorMessage = 'בעיית רשת. אנא בדוק/י את החיבור ונסה/י שוב.'
            }
            
            setUploadError(errorMessage)
        } finally {
            setIsPosting(false)
            setIsUploading(false)
        }
    }

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleClose = () => {
        navigate(-1)
    }

    return (
        <div className="create-post-modal-overlay" onClick={handleClose}>
            <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="create-post-header">
                    <div className="header-left">
                        {currentStep === 'share' && (
                            <button className="back-btn" onClick={handleBack}>
                                ←
                            </button>
                        )}
                    </div>
                    <h2>
                        {currentStep === 'select' && 'Create new post'}
                        {currentStep === 'share' && 'Share'}
                    </h2>
                    <div className="header-right">
                        {currentStep === 'share' && (
                            <button 
                                className="share-btn" 
                                onClick={handleShare}
                                disabled={isPosting}
                            >
                                {isPosting ? 'Sharing...' : 'Share'}
                            </button>
                        )}
                        <button className="create-post-close-btn" onClick={handleClose}>
                            ✖
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="create-post-content">
                    {currentStep === 'select' && selectedFiles.length === 0 ? (
                        <div 
                            className={`create-post-dropzone ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {/* Icon with overlapping squares */}
                            <div className="create-post-icon">
                                <div className="icon-square icon-square-back">
                                    <div className="icon-mountain"></div>
                                </div>
                                <div className="icon-square icon-square-front">
                                    <div className="icon-play"></div>
                                </div>
                            </div>
                            
                            {/* Text */}
                            <p className="create-post-text">Drag photos and videos here</p>
                            
                            {/* File Input */}
                            <input
                                type="file"
                                id="file-input"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                            
                            {/* Button */}
                            <label htmlFor="file-input" className="create-post-btn">
                                Select from computer
                            </label>
                        </div>
                    ) : currentStep === 'select' ? (
                        <div className="create-post-preview">
                            <div className="preview-files">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="preview-file">
                                        <button 
                                            className="remove-file-btn"
                                            onClick={() => removeFile(index)}
                                        >
                                            ✖
                                        </button>
                                        {file.type.startsWith('image/') ? (
                                            <img 
                                                src={URL.createObjectURL(file)} 
                                                alt={`Preview ${index + 1}`}
                                            />
                                        ) : (
                                            <VideoPlayer
                                                src={URL.createObjectURL(file)}
                                                duration={0} // Will be updated after upload
                                                width="100%"
                                                height="auto"
                                                className="preview-video"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="preview-actions">
                                <button className="preview-btn secondary" onClick={() => setSelectedFiles([])}>
                                    Clear All
                                </button>
                                <button className="preview-btn primary" onClick={handleNext}>
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="create-post-share">
                            <div className="share-preview">
                                {selectedFiles[0] && (
                                    selectedFiles[0].type.startsWith('image/') ? (
                                        <img 
                                            src={URL.createObjectURL(selectedFiles[0])} 
                                            alt="Share preview"
                                        />
                                    ) : (
                                        <VideoPlayer
                                            src={URL.createObjectURL(selectedFiles[0])}
                                            duration={uploadedVideoData?.duration || 0}
                                            width="100%"
                                            height="auto"
                                            className="share-preview-video"
                                        />
                                    )
                                )}
                            </div>
                            <div className="share-details">
                                <div className="user-info">
                                    <img src={loggedinUser?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} alt={loggedinUser?.username || loggedinUser?.fullname || 'משתמש'} />
                                    <span>{loggedinUser?.username || loggedinUser?.fullname || 'משתמש'}</span>
                                </div>
                                <TextInputWithEmoji
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    placeholder="Write a caption..."
                                    maxLength={500}
                                    rows={4}
                                    emojiPosition="bottom-right"
                                    className="create-post-caption"
                                />
                                {isUploading && (
                                    <div className="upload-status">
                                        <p>Uploading to Cloudinary...</p>
                                    </div>
                                )}
                                {uploadError && (
                                    <div className="upload-error">
                                        <p>{uploadError}</p>
                                        <button onClick={() => setUploadError('')}>✖</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
