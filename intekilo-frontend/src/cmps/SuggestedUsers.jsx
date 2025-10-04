import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../services/user'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'

export function SuggestedUsers() {
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [followingUsers, setFollowingUsers] = useState(new Set())
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSuggestedUsers()
  }, [])

  const loadSuggestedUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const users = await userService.getSuggestedUsers(5)
      setSuggestedUsers(users)
    } catch (err) {
      console.error('Failed to load suggested users:', err)
      setError('לא הצלחנו לטעון הצעות')
      showErrorMsg('Failed to load suggested users')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const users = await userService.getSuggestedUsers(5)
      setSuggestedUsers(users)
    } catch (err) {
      console.error('Failed to refresh suggested users:', err)
      setError('לא הצלחנו לטעון הצעות')
    } finally {
      setRefreshing(false)
    }
  }

  const handleFollow = async (userId) => {
    try {
      // Optimistic UI - update immediately
      setFollowingUsers(prev => new Set([...prev, userId]))
      
      await userService.followUser(userId)
      showSuccessMsg('Successfully followed user')
      
      // Remove the user from suggested list after following
      setSuggestedUsers(prev => prev.filter(user => user._id !== userId))
    } catch (err) {
      console.error('Failed to follow user:', err)
      // Revert optimistic update
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
      showErrorMsg('Failed to follow user')
    }
  }

  if (loading) {
    return <SuggestedUsersSkeleton />
  }

  if (error) {
    return (
      <div className="suggested-users">
        <div className="suggested-header">
          <h3>Suggested for you</h3>
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            title="רענן הצעות"
            aria-label="רענן הצעות"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRefresh}>
            נסה שוב
          </button>
        </div>
      </div>
    )
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="suggested-users">
        <div className="suggested-header">
          <h3>Suggested for you</h3>
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            title="רענן הצעות"
            aria-label="רענן הצעות"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="empty-state">
          <p>אין לנו כרגע הצעות עבורך</p>
          <Link to="/discover" className="discover-link">
            גלו משתמשים
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="suggested-users">
      <div className="suggested-header">
        <h3>Suggested for you</h3>
        <button 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
          title="רענן הצעות"
          aria-label="רענן הצעות"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="suggested-list">
        {suggestedUsers.map(user => (
          <SuggestedUserItem 
            key={user._id} 
            user={user} 
            onFollow={handleFollow}
            isFollowing={followingUsers.has(user._id)}
          />
        ))}
      </div>
    </div>
  )
}

function SuggestedUserItem({ user, onFollow, isFollowing }) {
  const handleFollowClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFollow(user._id)
  }

  return (
    <Link to={`/profile/${user._id}`} className="suggested-user-item">
      <div className="user-info">
        <div className="avatar">
          <img 
            src={user.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
            alt={user.username}
            loading="lazy"
          />
        </div>
        <div className="user-details">
          <div className="username">{user.username}</div>
          <div className="fullname">
            {user.fullname || user.username}
          </div>
        </div>
      </div>
      
      <button 
        className={`follow-btn ${isFollowing ? 'following' : ''}`}
        onClick={handleFollowClick}
        disabled={isFollowing}
        aria-label={`עקבו אחרי ${user.username}`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </Link>
  )
}

function SuggestedUsersSkeleton() {
  return (
    <div className="suggested-users">
      <div className="suggested-header">
        <h3>Suggested for you</h3>
        <div className="refresh-btn skeleton"></div>
      </div>
      
      <div className="suggested-list">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="suggested-user-item skeleton">
            <div className="user-info">
              <div className="avatar skeleton"></div>
              <div className="user-details">
                <div className="username skeleton"></div>
                <div className="fullname skeleton"></div>
              </div>
            </div>
            <div className="follow-btn skeleton"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
