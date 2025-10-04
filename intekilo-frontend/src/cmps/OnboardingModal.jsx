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
    const [showCompletion, setShowCompletion] = useState(false)
    const [onboardingData, setOnboardingData] = useState({
        dismissedAt: null,
        completedAt: null,
        version: '1.0'
    })
    
    const loggedinUser = useSelector(store => store.userModule.user)
    const [userStats, setUserStats] = useState({
        followedCount: 0,
        firstPostDone: false,
        postsCount: 0,
        profileComplete: false
    })

    const steps = [
        {
            id: 'follow',
            title: 'גילוי משתמשים',
            subtitle: 'בחירה מהירה של 3 משתמשים לעקיבה תמלא את הפיד בתוכן שמתאים לך',
            description: 'אפשר לבחור לפי תחומי עניין',
            icon: '👥',
            action: 'follow_users',
            hint: 'אפשר לבחור לפי תחומי עניין'
        },
        {
            id: 'post',
            title: 'יצירת פוסט ראשון',
            subtitle: 'ספר לנו מה אתה אוהב ✨',
            description: 'העלה תמונה או סרטון וספר לנו על הרגעים שלך',
            icon: '📝',
            action: 'create_post',
            hint: 'אופציונלי - אפשר לדלג'
        },
        {
            id: 'profile',
            title: 'השלמת פרופיל',
            subtitle: 'עדכן את הפרטים שלך',
            description: 'הוסף תמונת פרופיל ופרטים נוספים כדי שאחרים יכירו אותך טוב יותר',
            icon: '👤',
            action: 'complete_profile',
            hint: 'אפשר לשנות בכל זמן'
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
            
            // Check following count
            const followedCount = loggedinUser.following?.length || 0
            
            // Check posts count
            const userPosts = await postService.getPostsByOwner(loggedinUser._id)
            const postsCount = userPosts.length
            const firstPostDone = postsCount > 0

            // Check profile completion
            const hasCustomAvatar = !!(loggedinUser.imgUrl && loggedinUser.imgUrl !== 'https://randomuser.me/api/portraits/women/45.jpg')
            const hasBio = !!(loggedinUser.bio && loggedinUser.bio.trim().length > 0)
            const profileComplete = hasCustomAvatar && hasBio

            setUserStats({
                followedCount,
                firstPostDone,
                postsCount,
                profileComplete
            })

            // Auto-advance to next incomplete step
            if (followedCount >= 3 && currentStep === 0) {
                setCurrentStep(1)
            }
            if (firstPostDone && currentStep === 1) {
                setCurrentStep(2)
            }
            if (profileComplete && currentStep === 2) {
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
        if (userStats.followedCount >= 3) completedSteps++
        if (userStats.firstPostDone) completedSteps++
        if (userStats.profileComplete) completedSteps++
        
        const progressPercent = (completedSteps / steps.length) * 100
        setProgress(progressPercent)
    }

    const handleStepAction = async (step) => {
        console.log('🔍 handleStepAction called with:', step.action)
        
        switch (step.action) {
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
            case 'complete_profile':
                console.log('🔍 Navigating to profile page...')
                // Navigate to profile page
                navigate('/profile')
                break
        }
    }

    const handleSkip = () => {
        saveOnboardingData({ dismissedAt: new Date().toISOString() })
        onClose()
    }

    const handleComplete = () => {
        saveOnboardingData({ completedAt: new Date().toISOString() })
        setShowCompletion(true)
        // Show completion screen briefly before closing
        setTimeout(() => {
            onComplete?.()
            onClose()
        }, 2000)
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }


    if (!isOpen) return null

    // Show completion screen
    if (showCompletion) {
        return (
            <div className="onboarding-modal-overlay">
                <div className="onboarding-modal completion-modal">
                    <div className="completion-content">
                        <div className="celebration-icon">🎉</div>
                        <h2 className="completion-title">את/ה מוכן/ה להתחיל!</h2>
                        <p className="completion-subtitle">ההדרכה הושלמה בהצלחה</p>
                        <p className="completion-description">
                            עכשיו אתה יכול ליהנות מכל התכונות של InstaKilo
                        </p>
                        <button 
                            className="btn-primary completion-btn"
                            onClick={() => {
                                onComplete?.()
                                onClose()
                            }}
                        >
                            אל הפיד שלי
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const currentStepData = steps[currentStep]
    const isStepCompleted = (stepId) => {
        switch (stepId) {
            case 'follow': return userStats.followedCount >= 3
            case 'post': return userStats.firstPostDone
            case 'profile': return userStats.profileComplete
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
                    <p className="step-description">{currentStepData.description}</p>
                    {currentStepData.hint && (
                        <p className="step-hint">{currentStepData.hint}</p>
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

                    {currentStepData.action === 'complete_profile' && (
                        <div className="step-action">
                            <div className="profile-progress">
                                <p>פרופיל {userStats.profileComplete ? 'הושלם' : 'לא הושלם'}</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => handleStepAction(currentStepData)}
                                >
                                    השלם פרופיל
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
                            {currentStep === steps.length - 1 ? 'סיום' : 'המשך הדרכה'}
                        </button>
                    ) : (
                        <button 
                            className="btn-action"
                            onClick={handleNext}
                        >
                            להמשך {currentStep + 1}/{steps.length}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
