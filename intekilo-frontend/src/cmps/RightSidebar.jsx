// src/cmps/RightSidebar.jsx
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { SuggestedUsers } from './SuggestedUsers'

export function RightSidebar() {
    const navigate = useNavigate()
    
    // Get authentication state from Redux
    const isAuthenticated = useSelector(state => state.userModule?.isAuthenticated)
    const isHydrated = useSelector(state => state.userModule?.isHydrated)

    // Guard: Don't render sidebar content until hydrated
    if (!isHydrated) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner"></div>
            </div>
        )
    }

    // Guard: Don't render sidebar content if not authenticated
    if (!isAuthenticated) {
        return null // This should not happen due to AuthGuard, but safety check
    }

    function handleUserClick(userId) {
        console.log('🔗 RightSidebar: Navigating to profile with userId:', userId)
        
        // Validate userId is not empty
        if (!userId || userId.trim() === '') {
            console.error('❌ RightSidebar: Empty userId provided')
            return
        }
        
        navigate(`/profile/${userId}`)
    }

    return (
        <aside className="right-sidebar">
            <div className="user-info">
                <img 
                    src="https://randomuser.me/api/portraits/women/1.jpg" 
                    alt="User"
                    onClick={() => handleUserClick('current-user')}
                    style={{ cursor: 'pointer' }}
                />
                <div className="user-details">
                    <span 
                        className="username"
                        onClick={() => handleUserClick('current-user')}
                        style={{ cursor: 'pointer' }}
                    >
                        your_username
                    </span>
                    <span className="fullname">Your Full Name</span>
                </div>
                <button className="switch-btn">Switch</button>
            </div>

            <SuggestedUsers />

            <div className="footer-links">
                <p>About · Help · Press · API · Jobs · Privacy · Terms</p>
                <p>© 2025 InstaKilo FROM E.D</p>
            </div>
        </aside>
    )
}
