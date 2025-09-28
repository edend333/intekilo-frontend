import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/user'

export function FollowingModal({ isOpen, onClose, userId, isOwnProfile, onFollowingUpdate }) {
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredFollowing, setFilteredFollowing] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen && userId) {
            loadFollowing()
        }
    }, [isOpen, userId])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredFollowing(following)
        } else {
            const filtered = following.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredFollowing(filtered)
        }
    }, [following, searchTerm])

    const loadFollowing = async () => {
        try {
            setLoading(true)
            console.log('👥 Loading following for user:', userId)
            const followingData = await userService.getFollowing(userId)
            console.log('📊 Loaded following:', followingData.length)
            
            // Add following status for each user (should always be true for following list)
            const followingWithStatus = followingData.map(user => ({
                ...user,
                isFollowing: true
            }))
            
            setFollowing(followingWithStatus)
        } catch (error) {
            console.error('❌ Error loading following:', error)
            setFollowing([])
        } finally {
            setLoading(false)
        }
    }

    const handleUserClick = (userId) => {
        console.log('🔗 Navigate to profile:', userId)
        navigate(`/profile/${userId}`)
        onClose()
    }

    const handleUnfollow = async (followingId) => {
        try {
            await userService.unfollowUser(followingId)
            console.log('✅ Unfollowed user:', followingId)
            // Reload following to update the list
            loadFollowing()
            // Notify parent component to update stats
            if (onFollowingUpdate) {
                onFollowingUpdate()
            }
        } catch (error) {
            console.error('❌ Error unfollowing user:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="following-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>עוקב אחרי</h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>
                
                <div className="modal-search">
                    <div className="search-input-container">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="חיפוש"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <p>טוען רשימת עוקבים...</p>
                        </div>
                    ) : filteredFollowing.length === 0 ? (
                        <div className="empty-state">
                            <p>
                                {searchTerm.trim() === '' 
                                    ? 'לא עוקב אחרי אף אחד' 
                                    : 'לא נמצאו משתמשים התואמים לחיפוש'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="following-list">
                            {filteredFollowing.map((user) => (
                                <div key={user._id} className="following-item">
                                    <div 
                                        className="following-info"
                                        onClick={() => handleUserClick(user._id)}
                                    >
                                        <img 
                                            src={user.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
                                            alt={user.username}
                                            className="following-avatar"
                                        />
                                        <div className="following-details">
                                            <span className="following-username">{user.username}</span>
                                            <span className="following-fullname">{user.fullname}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="following-actions">
                                        {isOwnProfile && (
                                            <button 
                                                className="unfollow-btn"
                                                onClick={() => handleUnfollow(user._id)}
                                            >
                                                Following
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
