import { useState, useEffect } from 'react'
import { PostPreview } from './PostPreview.jsx'
import { EmptyState } from '../EmptyState.jsx'
import { PostSkeleton, PostListSkeleton, LoadingSpinner } from '../PostSkeleton.jsx'
import { useInfiniteScroll } from '../../customHooks/useInfiniteScroll.js'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { loadAllComments } from '../../store/comments/comment.actions'
import { userService } from '../../services/user'
import { loadFollowingStats } from '../../store/user.actions'

export function PostList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const [followingStats, setFollowingStats] = useState(null)
  
  // Get authentication state from Redux
  const loggedinUser = useSelector(store => store.userModule.user)
  const isAuthenticated = useSelector(store => store.userModule.isAuthenticated)
  const isHydrated = useSelector(store => store.userModule.isHydrated)
  
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    isEmpty,
    lastElementRef,
    refreshPosts
  } = useInfiniteScroll()

  useEffect(() => {
    // Load comments for all posts
    if (posts.length > 0) {
      dispatch(loadAllComments())
    }
  }, [posts, dispatch])

  // Listen for avatar updates to refresh posts
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      const { updatedUser } = event.detail
      if (updatedUser) {
        // Reload posts to get updated owner data
        refreshPosts()
      }
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate)
    }
  }, [refreshPosts])

  const checkOnboardingStatus = () => {
    if (!loggedinUser) return
    
    try {
      const onboardingData = localStorage.getItem('intekilo_onboarding')
      const isCompleted = onboardingData && JSON.parse(onboardingData).completedAt
      const isDismissed = onboardingData && JSON.parse(onboardingData).dismissedAt
      
      // Show banner if not completed and not dismissed
      if (!isCompleted && !isDismissed) {
        setShowOnboardingBanner(true)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const handleOnboardingClick = () => {
    // Trigger onboarding modal
    window.dispatchEvent(new CustomEvent('showOnboarding'))
  }

  // Check onboarding status when user changes
  useEffect(() => {
    checkOnboardingStatus()
  }, [loggedinUser])

  // Load following stats when user changes
  useEffect(() => {
    if (loggedinUser?._id) {
      loadFollowingStats(loggedinUser._id)
        .then(stats => {
          setFollowingStats(stats)
        })
        .catch(err => {
          console.error('Failed to load following stats:', err)
        })
    }
  }, [loggedinUser])

  // Guard: Don't render feed content until hydrated
  if (!isHydrated) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
      </div>
    )
  }

  // Guard: Don't render feed content if not authenticated
  if (!isAuthenticated) {
    return null // This should not happen due to AuthGuard, but safety check
  }

  // Show loading skeleton for initial load
  if (loading) {
    return (
      <>
        {showOnboardingBanner && (
          <div className="onboarding-banner">
            <div className="banner-content">
              <span className="banner-text">השלם את ההגדרה הראשונית שלך</span>
              <button className="banner-btn" onClick={handleOnboardingClick}>
                התחל
              </button>
              <button 
                className="banner-close" 
                onClick={() => setShowOnboardingBanner(false)}
              >
                ✖
              </button>
            </div>
          </div>
        )}
        <PostListSkeleton count={3} />
      </>
    )
  }

  // Show empty state if no posts and not loading
  if (isEmpty && !loading) {
    return (
      <>
        {showOnboardingBanner && (
          <div className="onboarding-banner">
            <div className="banner-content">
              <span className="banner-text">השלם את ההגדרה הראשונית שלך</span>
              <button className="banner-btn" onClick={handleOnboardingClick}>
                התחל
              </button>
              <button 
                className="banner-close" 
                onClick={() => setShowOnboardingBanner(false)}
              >
                ✖
              </button>
            </div>
          </div>
        )}
        {followingStats && followingStats.followingCount > 0 ? (
          <div className="empty-feed-with-stats">
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">📭</div>
                <h3 className="empty-state-title">הפיד עדיין ריק</h3>
                <p className="empty-state-subtitle">
                  אתה עוקב אחרי {followingStats.followingCount} משתמשים, 
                  אבל הם עדיין לא פרסמו כלום
                </p>
                <div className="empty-state-actions">
                  <button
                    className="empty-state-btn primary"
                    onClick={() => navigate('/discover')}
                  >
                    גלה משתמשים נוספים
                  </button>
                  <button
                    className="empty-state-btn secondary"
                    onClick={() => navigate('/create-post')}
                  >
                    צור פוסט ראשון
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState type="empty_feed" />
        )}
      </>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="error-state">
        <h3>שגיאה בטעינת הפיד</h3>
        <p>{error}</p>
        <button onClick={refreshPosts} className="retry-btn">
          נסה שוב
        </button>
      </div>
    )
  }

  return (
    <>
      {showOnboardingBanner && (
        <div className="onboarding-banner">
          <div className="banner-content">
            <span className="banner-text">השלם את ההגדרה הראשונית שלך</span>
            <button className="banner-btn" onClick={handleOnboardingClick}>
              התחל
            </button>
            <button 
              className="banner-close" 
              onClick={() => setShowOnboardingBanner(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
      
      <ul className="post-list">
        {posts.map((post, idx) => {
          const isLast = idx === posts.length - 1
          return (
            <li key={post._id} ref={isLast ? lastElementRef : null}>
              <PostPreview post={post} onOpenPost={() => navigate(`/post/${post._id}`)} />
            </li>
          )
        })}
      </ul>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="loading-more">
          <PostSkeleton />
        </div>
      )}

      {/* No more posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="no-more-posts">
          <p>אין עוד פוסטים להצגה</p>
        </div>
      )}
    </>
  )
}
