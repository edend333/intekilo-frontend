import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { userService } from '../services/user'
import { EmptyState } from '../cmps/EmptyState.jsx'

export function Discover() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [following, setFollowing] = useState(new Set())
    const loggedinUser = useSelector(store => store.userModule.user)
    
    const isOnboarding = searchParams.get('onboarding') === 'true'

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            
            const allUsers = await userService.getUsers()
            // Filter out current user and already followed users
            const filteredUsers = allUsers.filter(user => 
                user._id !== loggedinUser._id && 
                !loggedinUser.following?.includes(user._id)
            )
            
            // Shuffle and take up to 6 random suggestions
            const shuffled = filteredUsers.sort(() => 0.5 - Math.random())
            const suggestions = shuffled.slice(0, 6)
            
            setUsers(suggestions)
            
            // Initialize following state
            setFollowing(new Set(loggedinUser.following || []))
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        loadUsers(true)
    }

    const handleFollowToggle = async (userId) => {
        try {
            if (following.has(userId)) {
                await userService.unfollowUser(userId)
                setFollowing(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(userId)
                    return newSet
                })
            } else {
                await userService.followUser(userId)
                setFollowing(prev => new Set([...prev, userId]))
                
                // If in onboarding mode and reached 3 follows, go back to onboarding
                if (isOnboarding && following.size + 1 >= 3) {
                    setTimeout(() => {
                        navigate('/')
                        // Trigger onboarding completion
                        window.dispatchEvent(new CustomEvent('onboardingStepComplete', { 
                            detail: { step: 'follow_users' } 
                        }))
                    }, 1000)
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error)
        }
    }

    if (loading) return <div>Loading...</div>
    if (users.length === 0) return <EmptyState type="no_suggestions" />

    return (
        <div className="discover-page">
            <div className="discover-header">
                <h1>גילוי משתמשים</h1>
                <p>{isOnboarding ? 'בחר 3 משתמשים לעקיבה כדי להמשיך' : 'גלה משתמשים מעניינים לעקוב אחריהם'}</p>
                {!isOnboarding && (
                    <button 
                        className="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? 'מרענן...' : 'רענון הצעות'}
                    </button>
                )}
            </div>

            <div className="users-grid">
                {users.map(user => (
                    <div key={user._id} className="user-card">
                        <div className="user-avatar">
                            <img src={user.imgUrl} alt={user.fullname} />
                        </div>
                        
                        <div className="user-info">
                            <h3>{user.username}</h3>
                            <p>{user.fullname}</p>
                            {user.bio && <p className="user-bio">{user.bio}</p>}
                        </div>
                        
                        <div className="user-actions">
                            <button 
                                className={`follow-btn ${following.has(user._id) ? 'following' : 'follow'}`}
                                onClick={() => handleFollowToggle(user._id)}
                            >
                                {following.has(user._id) ? 'בעקיבה ✓' : 'הוספה לעקיבה'}
                            </button>
                            {following.has(user._id) && (
                                <button 
                                    className="cancel-btn"
                                    onClick={() => handleFollowToggle(user._id)}
                                >
                                    בטל
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
