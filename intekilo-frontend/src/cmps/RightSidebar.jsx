// src/cmps/RightSidebar.jsx
import { useNavigate } from 'react-router-dom'

export function RightSidebar() {
    const navigate = useNavigate()

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

            <div className="suggested">
                <h4>Suggested for you</h4>
                <ul className="suggested-list">
                    <li className="suggested-user">
                        <img 
                            src="https://randomuser.me/api/portraits/men/2.jpg" 
                            alt="User 1"
                            onClick={() => handleUserClick('user1')}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className="user-details">
                            <span 
                                className="username"
                                onClick={() => handleUserClick('user1')}
                                style={{ cursor: 'pointer' }}
                            >
                                user1
                            </span>
                            <span className="mutual">Followed by ...</span>
                        </div>
                        <button className="follow-btn">Follow</button>
                    </li>
                </ul>
            </div>

            <div className="footer-links">
                <p>About · Help · Press · API · Jobs · Privacy · Terms</p>
                <p>© 2025 InstaKilo FROM E.D</p>
            </div>
        </aside>
    )
}
