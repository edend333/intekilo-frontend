import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/user'

export function FollowersModal({ isOpen, onClose, userId, isOwnProfile, currentUserId, onFollowersUpdate }) {
    const [followers, setFollowers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredFollowers, setFilteredFollowers] = useState([])
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
            setFilteredFollowers(followers)
        } else {
            const filtered = followers.filter(follower => 
                follower.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                follower.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredFollowers(filtered)
        }
    }, [followers, searchTerm])

    const loadRelationships = async () => {
        try {
            setLoading(true)
            console.log('🔗 Loading relationships for profileId:', userId)
            
            // Use the new relationships endpoint that ensures profileId-based data
            const relationships = await userService.getRelationships(userId)
            console.log('📊 Loaded relationships:', relationships)
            
            // Set followers data from relationships
            setFollowers(relationships.followers || [])
            setCounts(relationships.counts || { followers: 0, following: 0 })
            
            // For followers, we need to check if current user follows each follower
            // But since this endpoint returns followers of the profileId, we check if current user follows them
            const followersWithStatus = await Promise.all(
                (relationships.followers || []).map(async (follower) => {
                    try {
                        const isFollowingStatus = await userService.isFollowing(follower._id)
                        return { ...follower, isFollowing: isFollowingStatus }
                    } catch (error) {
                        console.error('❌ Error checking following status for:', follower._id)
                        return { ...follower, isFollowing: false }
                    }
                })
            )
            
            setFollowers(followersWithStatus)
        } catch (error) {
            console.error('❌ Error loading relationships:', error)
            setFollowers([])
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

    const handleFollowToggle = async (followerId, isCurrentlyFollowing) => {
        try {
            if (isCurrentlyFollowing) {
                await userService.unfollowUser(followerId)
                console.log('✅ Unfollowed user:', followerId)
            } else {
                await userService.followUser(followerId)
                console.log('✅ Followed user:', followerId)
            }
            // Reload relationships to update the list
            await loadRelationships()
            // Notify parent component to update stats
            if (onFollowersUpdate) {
                onFollowersUpdate()
            }
        } catch (error) {
            console.error('❌ Error toggling follow status:', error)
        }
    }

    const handleRemoveFollower = async (followerId) => {
        try {
            console.log('🗑️ Remove follower:', followerId)
            await userService.removeFollower(followerId)
            console.log('✅ Successfully removed follower')
            // Reload relationships to update the UI
            await loadRelationships()
            // Notify parent component to update stats
            if (onFollowersUpdate) {
                onFollowersUpdate()
            }
        } catch (error) {
            console.error('❌ Error removing follower:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="followers-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>עוקבים ({counts.followers})</h2>
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
                            <p>טוען עוקבים...</p>
                        </div>
                    ) : filteredFollowers.length === 0 ? (
                        <div className="empty-state">
                            <p>
                                {searchTerm.trim() === '' 
                                    ? 'אין עוקבים עדיין' 
                                    : 'לא נמצאו עוקבים התואמים לחיפוש'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="followers-list">
                            {filteredFollowers.map((follower) => (
                                <div key={follower._id} className="follower-item">
                                    <div 
                                        className="follower-info"
                                        onClick={() => handleUserClick(follower._id)}
                                    >
                                        <img 
                                            src={follower.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
                                            alt={follower.username}
                                            className="follower-avatar"
                                        />
                                        <div className="follower-details">
                                            <span className="follower-username">{follower.username}</span>
                                            <span className="follower-fullname">{follower.fullname}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="follower-actions">
                                        {!isOwnProfile && currentUserId && follower._id !== currentUserId && (
                                            <button 
                                                className="follow-btn"
                                                onClick={() => handleFollowToggle(follower._id, follower.isFollowing)}
                                            >
                                                {follower.isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                        {isOwnProfile && (
                                            <button 
                                                className="remove-btn"
                                                onClick={() => handleRemoveFollower(follower._id)}
                                            >
                                                Remove
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
