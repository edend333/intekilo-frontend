import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { userService } from './services/user'
import { postService } from './services/post/post.service'
import { HomePage } from './pages/HomePage'
import { ChatApp } from './pages/Chat.jsx'
import { AdminIndex } from './pages/AdminIndex.jsx'
import { commentService } from './services/comment/comment.service.js'
import { UserDetails } from './pages/UserDetails'
import { UserMsg } from './cmps/UserMsg.jsx'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { Login } from './pages/Login.jsx'
import { Signup } from './pages/Signup.jsx'
import { AuthWelcome } from './pages/AuthWelcome.jsx'
import { Sidebar } from './cmps/Sidebar.jsx'
import { ModalPost } from './pages/ModalPost.jsx'
import { Profile } from './pages/Profile.jsx'
import { CreatePost } from './pages/CreatePost.jsx'
import { Discover } from './pages/Discover.jsx'
import AuthInitializer from './cmps/AuthInitializer.jsx'
import { OnboardingModal } from './cmps/OnboardingModal.jsx'


export function RootCmp() {
    return (
        <AuthInitializer>
            <div className="main-container">
                <Sidebar />
                {/* <UserMsg /> */}

                <main>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/auth" element={<AuthWelcome />} />
                        <Route path="/login" element={<LoginSignup />}>
                            <Route index element={<Login />} />
                            <Route path="signup" element={<Signup />} />
                        </Route>
                        <Route path="/signup" element={<Signup />} />
                        
                        {/* Protected routes */}
                        <Route path="/" element={
                            <AuthGuard>
                                <HomePage />
                            </AuthGuard>
                        }>
                            <Route path="post/:postId" element={<ModalPost />} />
                        </Route>

                        <Route path="user/:id" element={<UserDetails />} />
                        <Route path="profile/:userId?" element={
                            <AuthGuard>
                                <Profile />
                            </AuthGuard>
                        } />
                        <Route path="create-post" element={
                            <AuthGuard>
                                <CreatePost />
                            </AuthGuard>
                        } />
                        <Route path="discover" element={
                            <AuthGuard>
                                <Discover />
                            </AuthGuard>
                        } />
                        <Route path="chat" element={
                            <AuthGuard>
                                <ChatApp />
                            </AuthGuard>
                        } />
                        <Route path="admin" element={
                            <AuthGuard checkAdmin={true}>
                                <AdminIndex />
                            </AuthGuard>
                        } />
                    </Routes>
                </main>
                
                <OnboardingWrapper />
            </div>
        </AuthInitializer>
    )
}




function AuthGuard({ children, checkAdmin = false }) {
    const user = useSelector(state => state.userModule?.user)
    const isHydrated = useSelector(state => state.userModule?.isHydrated)
    const isAuthenticated = useSelector(state => state.userModule?.isAuthenticated)
    
    // Don't redirect until hydration is complete
    if (!isHydrated) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner"></div>
            </div>
        )
    }
    
    const isNotAllowed = !isAuthenticated || (checkAdmin && !user?.isAdmin)
    if (isNotAllowed) {
        if (!isAuthenticated) {
            console.log('יש להתחבר כדי להמשיך')
        }
        return <Navigate to="/auth" replace />
    }
    return children
}

function OnboardingWrapper() {
    const [showOnboarding, setShowOnboarding] = useState(false)
    const user = useSelector(state => state.userModule?.user)

    useEffect(() => {
        if (user) {
            checkOnboardingStatus()
        }
        
        // Listen for banner click event
        const handleShowOnboarding = () => {
            setShowOnboarding(true)
        }
        
        // Listen for onboarding step completion
        const handleOnboardingStepComplete = (event) => {
            console.log('🔍 Onboarding step completed:', event.detail)
            // Refresh user stats and check if should advance to next step
            checkOnboardingStatus()
        }
        
        window.addEventListener('showOnboarding', handleShowOnboarding)
        window.addEventListener('onboardingStepComplete', handleOnboardingStepComplete)
        
        return () => {
            window.removeEventListener('showOnboarding', handleShowOnboarding)
            window.removeEventListener('onboardingStepComplete', handleOnboardingStepComplete)
        }
    }, [user])

    const checkOnboardingStatus = async () => {
        try {
            // Check if user has posts
            const posts = await postService.getPostsByOwner(user._id)
            const hasPosts = posts.length > 0
            
            // Check local storage for onboarding status
            const onboardingData = localStorage.getItem('intekilo_onboarding')
            const isCompleted = onboardingData && JSON.parse(onboardingData).completedAt
            const isDismissed = onboardingData && JSON.parse(onboardingData).dismissedAt
            
            // Show onboarding if no posts and not completed/dismissed
            if (!hasPosts && !isCompleted && !isDismissed) {
                setShowOnboarding(true)
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error)
        }
    }

    const handleOnboardingComplete = () => {
        setShowOnboarding(false)
    }

    const handleOnboardingClose = () => {
        setShowOnboarding(false)
    }

    if (!user) return null

    return (
        <OnboardingModal 
            isOpen={showOnboarding}
            onClose={handleOnboardingClose}
            onComplete={handleOnboardingComplete}
        />
    )
}
