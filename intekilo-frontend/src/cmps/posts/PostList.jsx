import { useState, useEffect } from 'react'
import { PostPreview } from './PostPreview.jsx'
import { EmptyState } from '../EmptyState.jsx'
import { useScroll } from '../../customHooks/useScroll.js'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { loadAllComments } from '../../store/comments/comment.actions'
import { loadPosts } from '../../store/posts/post.actions'
import { userService } from '../../services/user'

export function PostList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const posts = useSelector(store => store.postModule.posts)
  const loggedinUser = useSelector(store => store.userModule.user)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // טען פוסטים ותגובות אוטומטית
        await dispatch(loadPosts())
        dispatch(loadAllComments())
        
        // Check if should show onboarding banner
        checkOnboardingStatus()
      } catch (error) {
        console.error('❌ PostList: Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [dispatch])

  // Listen for avatar updates to refresh posts
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      const { updatedUser } = event.detail
      if (updatedUser) {
        console.log('🔄 PostList: Avatar updated, refreshing posts')
        // Reload posts to get updated owner data
        dispatch(loadPosts())
      }
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate)
    }
  }, [dispatch])

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

  const lastElementRef = useScroll(() => {
    // בעתיד, כאן תקרי לשרת עם page/limit מהפג'ינציה בצד שרת
  })

  if (loading) return <div>Loading posts...</div>
  if (!posts?.length) return <EmptyState type="empty_feed" />

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

      <div style={{ height: '1000px' }}></div>
    </>
  )
}
