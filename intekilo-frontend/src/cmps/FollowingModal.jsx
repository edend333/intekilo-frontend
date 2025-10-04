import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/user'

export function FollowingModal({ isOpen, onClose, userId, isOwnProfile, currentUserId, onFollowingUpdate }) {
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredFollowing, setFilteredFollowing] = useState([])
    const [counts, setCounts] = useState({ followers: 0, following: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen && userId) {
            loadRelationships()
        } else if (!isOpen) {
            // Clear search when modal closes
            setSearchTerm('')
        }
    }, [isOpen, userId])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredFollowing(following)
        } else {
            const filtered = following.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredFollowing(filtered)
        }
    }, [following, searchTerm])

    const loadRelationships = async () => {
        try {
            setLoading(true)
            console.log('🔗 Loading relationships for profileId:', userId)
            
            // Use the new relationships endpoint that ensures profileId-based data
            const relationships = await userService.getRelationships(userId)
            console.log('📊 Loaded relationships:', relationships)
            
            // Set following data from relationships (always true since these are people the profile follows)
            const followingWithStatus = (relationships.following || []).map(user => ({
                ...user,
                isFollowing: true
            }))
            
            setFollowing(followingWithStatus)
            setCounts(relationships.counts || { followers: 0, following: 0 })
        } catch (error) {
            console.error('❌ Error loading relationships:', error)
            setFollowing([])
            setCounts({ followers: 0, following: 0 })
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
            // Reload relationships to update the list
            await loadRelationships()
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
                    <h2>עוקב אחרי ({counts.following})</h2>
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
                                        {isOwnProfile && currentUserId && user._id !== currentUserId && (
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
