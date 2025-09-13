import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { userService } from '../services/user'
import { CommentsModal } from '../cmps/CommentsModal.jsx'

export function Profile() {
    const loggedinUser = useSelector(store => store.userModule.user)
    const [activeTab, setActiveTab] = useState('posts')
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedPost, setSelectedPost] = useState(null)
    const [showModal, setShowModal] = useState(false)

    // Mock posts data - replace with real data from API
    const mockPosts = [
        {
            _id: '1',
            imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            txt: 'כשהוא אומר לך לא על שופינג 😤🛍️',
            by: { 
                fullname: user?.fullname || 'User', 
                imgUrl: user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' 
            },
            likedBy: ['user1', 'user2'],
            createdAt: new Date()
        },
        {
            _id: '2',
            imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            txt: 'הדוג-מנית הישראלית 🐕',
            by: { 
                fullname: user?.fullname || 'User', 
                imgUrl: user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' 
            },
            likedBy: ['user1', 'user2', 'user3'],
            createdAt: new Date()
        },
        {
            _id: '3',
            imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            txt: 'שראית את החדשה שלו:',
            by: { 
                fullname: user?.fullname || 'User', 
                imgUrl: user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' 
            },
            likedBy: ['user1'],
            createdAt: new Date()
        },
        {
            _id: '4',
            imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            txt: 'כשאת שולחת לו הודעה והוא לא עונה אבל הוא מחובר:',
            by: { 
                fullname: user?.fullname || 'User', 
                imgUrl: user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' 
            },
            likedBy: ['user1', 'user2', 'user3', 'user4'],
            createdAt: new Date()
        },
        {
            _id: '5',
            imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            txt: 'החברה הזו עם הפוזות המוגזמות:',
            by: { 
                fullname: user?.fullname || 'User', 
                imgUrl: user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' 
            },
            likedBy: ['user1', 'user2'],
            createdAt: new Date()
        },
        {
            _id: '6',
            imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
            txt: 'על הבר מלמלתי "לעולם לא יכאב לי יותר ממה שכואב"',
            by: { 
                fullname: user?.fullname || 'User', 
                imgUrl: user?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png' 
            },
            likedBy: ['user1', 'user2', 'user3', 'user4', 'user5'],
            createdAt: new Date()
        }
    ]

    const handlePostClick = (post) => {
        setSelectedPost(post)
        setShowModal(true)
    }

    useEffect(() => {
        const loadUser = async () => {
            try {
                // Try to get user from Redux store first
                if (loggedinUser) {
                    setUser(loggedinUser)
                    setLoading(false)
                    return
                }

                // If not in Redux, try to get from userService
                const userFromService = userService.getLoggedinUser()
                if (userFromService) {
                    setUser(userFromService)
                }
            } catch (err) {
                console.error('Error loading user:', err)
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [loggedinUser])

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>Please log in to view your profile</div>
    }

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-picture-section">
                    <div className="profile-picture">
                        <img 
                            src={user.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
                            alt={user.fullname}
                        />
                    </div>
                </div>

                <div className="profile-info">
                    <div className="profile-username-section">
                        <h1 className="username">{user.username || user.fullname}</h1>
                        <div className="profile-actions">
                            <button className="btn-edit-profile">ערוך פרופיל</button>
                            <button className="btn-view-archive">הצג ארכיון</button>
                            <button className="btn-settings">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">26</span>
                            <span className="stat-label">פוסטים</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">142</span>
                            <span className="stat-label">עוקבים</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">103</span>
                            <span className="stat-label">עוקב אחרי</span>
                        </div>
                    </div>

                    <div className="profile-bio">
                        <p className="bio-text">{user.fullname}</p>
                        <p className="bio-description">הדוג-מנית הישראלית 🐕</p>
                    </div>
                </div>
            </div>

            {/* Story Highlights */}
            <div className="story-highlights">
                <div className="highlight-item">
                    <div className="highlight-circle">
                        <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt="Highlight" />
                    </div>
                    <span className="highlight-label">Highlights</span>
                </div>
                <div className="highlight-item">
                    <div className="highlight-circle">
                        <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt="Highlight" />
                    </div>
                    <span className="highlight-label">New</span>
                </div>
                <div className="highlight-item">
                    <div className="highlight-circle new-highlight">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </div>
                    <span className="highlight-label">הוסף</span>
                </div>
            </div>

            {/* Content Navigation Tabs */}
            <div className="content-tabs">
                <button 
                    className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-2-2H7V7h10v10z"/>
                    </svg>
                </button>
                <button 
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                </button>
                <button 
                    className={`tab ${activeTab === 'tagged' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tagged')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l-1.99-2.01A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.54.37-2.01.99L1 14.5V22h2v-6h2.5L8 17h8l2.5-1H20v6h2z"/>
                    </svg>
                </button>
            </div>

            {/* Posts Grid */}
            <div className="posts-grid">
                {mockPosts.map((post) => (
                    <div key={post._id} className="post-item" onClick={() => handlePostClick(post)}>
                        <img src={post.imgUrl} alt="Post" />
                        <div className="post-overlay">
                            <div className="post-stats">
                                <span className="likes">❤️ {post.likedBy.length}</span>
                                <span className="comments">💬 {Math.floor(Math.random() * 100)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comments Modal for Image Viewing */}
            <CommentsModal 
                post={selectedPost}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    )
}
