import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/user'
import { postService } from '../services/post/post.service'
import { ImgUploader } from './ImgUploader.jsx'

const ONBOARDING_STORAGE_KEY = 'intekilo_onboarding'

export function OnboardingModal({ isOpen, onClose, onComplete }) {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [onboardingData, setOnboardingData] = useState({
        dismissedAt: null,
        completedAt: null,
        version: '1.0'
    })
    
    const loggedinUser = useSelector(store => store.userModule.user)
    const [userStats, setUserStats] = useState({
        avatarDone: false,
        followedCount: 0,
        firstPostDone: false,
        postsCount: 0
    })

    const steps = [
        {
            id: 'avatar',
            title: 'תמונת פרופיל',
            subtitle: 'תמונה עוזרת לאחרים לזהות את הפרופיל שלך',
            icon: '👤',
            action: 'upload_avatar',
            hint: 'אפשר לשנות בכל זמן'
        },
        {
            id: 'follow',
            title: 'גילוי משתמשים',
            subtitle: 'בחירה מהירה של 3 משתמשים לעקיבה תמלא את הפיד בתוכן שמתאים לך',
            icon: '👥',
            action: 'follow_users',
            hint: 'אפשר לבחור לפי תחומי עניין'
        },
        {
            id: 'post',
            title: 'פוסט ראשון',
            subtitle: 'ספר לנו מה אתה אוהב ✨',
            icon: '📝',
            action: 'create_post',
            hint: 'אופציונלי - אפשר לדלג',
            optional: true
        }
    ]

    useEffect(() => {
        if (isOpen) {
            loadOnboardingData()
            checkUserProgress()
        }
    }, [isOpen, loggedinUser])

    useEffect(() => {
        calculateProgress()
    }, [userStats])

    const loadOnboardingData = () => {
        try {
            const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
            if (stored) {
                const data = JSON.parse(stored)
                setOnboardingData(data)
                
                // If completed or dismissed, don't show
                if (data.completedAt || data.dismissedAt) {
                    onClose()
                    return
                }
            }
        } catch (error) {
            console.error('Error loading onboarding data:', error)
        }
    }

    const saveOnboardingData = (updates) => {
        try {
            const newData = { ...onboardingData, ...updates }
            setOnboardingData(newData)
            localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newData))
        } catch (error) {
            console.error('Error saving onboarding data:', error)
        }
    }

    const checkUserProgress = async () => {
        if (!loggedinUser) return

        try {
            setIsLoading(true)
            
            // Check avatar
            const avatarDone = !!(loggedinUser.imgUrl && loggedinUser.imgUrl !== 'https://randomuser.me/api/portraits/women/45.jpg')
            
            // Check following count
            const followedCount = loggedinUser.following?.length || 0
            
            // Check posts count
            const userPosts = await postService.getPostsByOwner(loggedinUser._id)
            const postsCount = userPosts.length
            const firstPostDone = postsCount > 0

            setUserStats({
                avatarDone,
                followedCount,
                firstPostDone,
                postsCount
            })

            // Auto-advance to next incomplete step
            if (avatarDone && currentStep === 0) {
                setCurrentStep(1)
            }
            if (followedCount >= 3 && currentStep === 1) {
                setCurrentStep(2)
            }
            if (firstPostDone && currentStep === 2) {
                // All steps completed
                handleComplete()
            }

        } catch (error) {
            console.error('Error checking user progress:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const calculateProgress = () => {
        let completedSteps = 0
        if (userStats.avatarDone) completedSteps++
        if (userStats.followedCount >= 3) completedSteps++
        if (userStats.firstPostDone) completedSteps++
        
        const progressPercent = (completedSteps / steps.length) * 100
        setProgress(progressPercent)
    }

    const handleStepAction = async (step) => {
        console.log('🔍 handleStepAction called with:', step.action)
        
        switch (step.action) {
            case 'upload_avatar':
                // This will be handled by the ImgUploader component
                break
            case 'follow_users':
                console.log('🔍 Navigating to discover page...')
                // Navigate to discover page with onboarding parameter
                navigate('/discover?onboarding=true')
                break
            case 'create_post':
                console.log('🔍 Navigating to create post page...')
                // Navigate to create post page
                navigate('/create-post')
                break
        }
    }

    const handleSkip = () => {
        saveOnboardingData({ dismissedAt: new Date().toISOString() })
        onClose()
    }

    const handleComplete = () => {
        saveOnboardingData({ completedAt: new Date().toISOString() })
        onComplete?.()
        onClose()
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleAvatarUpload = async (imgUrl) => {
        try {
            setIsLoading(true)
            const updatedUser = await userService.update({ ...loggedinUser, imgUrl })
            // Update Redux store
            // dispatch(setUser(updatedUser))
            await checkUserProgress()
            // Auto-advance to next step after successful upload
            if (currentStep === 0) {
                setCurrentStep(1)
            }
        } catch (error) {
            console.error('Error updating avatar:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    const currentStepData = steps[currentStep]
    const isStepCompleted = (stepId) => {
        switch (stepId) {
            case 'avatar': return userStats.avatarDone
            case 'follow': return userStats.followedCount >= 3
            case 'post': return userStats.firstPostDone
            default: return false
        }
    }

    return (
        <div className="onboarding-modal-overlay">
            <div className="onboarding-modal">
                <div className="onboarding-header">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="step-indicator">
                        {steps.map((step, index) => (
                            <div 
                                key={step.id}
                                className={`step-dot ${index === currentStep ? 'active' : ''} ${isStepCompleted(step.id) ? 'completed' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="onboarding-content">
                    <div className="step-icon">
                        {isStepCompleted(currentStepData.id) ? '✅' : currentStepData.icon}
                    </div>
                    
                    <h2 className="step-title">{currentStepData.title}</h2>
                    <p className="step-subtitle">{currentStepData.subtitle}</p>
                    {currentStepData.hint && (
                        <p className="step-hint">{currentStepData.hint}</p>
                    )}

                    {currentStepData.action === 'upload_avatar' && (
                        <div className="step-action">
                            <ImgUploader onUploaded={handleAvatarUpload} />
                            {isLoading && <div className="loading">מעדכן תמונה...</div>}
                        </div>
                    )}

                    {currentStepData.action === 'follow_users' && (
                        <div className="step-action">
                            <div className="follow-progress">
                                <p>נבחרו {userStats.followedCount} מתוך 3</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => handleStepAction(currentStepData)}
                                    type="button"
                                >
                                    גילוי משתמשים
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStepData.action === 'create_post' && (
                        <div className="step-action">
                            <div className="post-progress">
                                <p>פרסמת {userStats.postsCount} פוסטים</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => handleStepAction(currentStepData)}
                                >
                                    צור פוסט ראשון
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <div className="onboarding-footer">
                    <button className="btn-skip" onClick={handleSkip}>
                        דלג לעכשיו
                    </button>
                    
                    {isStepCompleted(currentStepData.id) ? (
                        <button className="btn-complete" onClick={handleNext}>
                            {currentStep === steps.length - 1 ? 'סיום' : 'הבא'}
                        </button>
                    ) : (
                        <button 
                            className={`btn-action ${currentStepData.action === 'follow_users' && userStats.followedCount < 3 ? 'disabled' : ''}`}
                            onClick={() => handleStepAction(currentStepData)}
                            disabled={currentStepData.action === 'follow_users' && userStats.followedCount < 3}
                        >
                            {currentStepData.action === 'upload_avatar' ? 'בחירת תמונה' : 
                             currentStepData.action === 'follow_users' ? `להמשך (${userStats.followedCount}/3)` : 
                             currentStepData.action === 'create_post' ? 'צור פוסט' :
                             'המשך'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
