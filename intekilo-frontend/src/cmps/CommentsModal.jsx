import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addComment, loadComments } from '../store/comments/comment.actions'
import { addPostLike, removePostLike } from '../store/posts/post.actions'
import { VideoPlayer } from './VideoPlayer'
import TextInputWithEmoji from './TextInputWithEmoji'
import { isLikedByMe, getLikeCount, getPostComments, getRelativeTime } from '../utils/postUtils'
import { getTimeAgo } from '../utils/timeUtils'

export function CommentsModal({ postId, post: propPost, isOpen, onClose }) {
  const [newComment, setNewComment] = useState('')
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [pinchStart, setPinchStart] = useState(null)
  const [dragStart, setDragStart] = useState(null)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const comments = useSelector(store => store.commentModule.comments)
  const posts = useSelector(store => store.postModule.posts)
  const loggedinUser = useSelector(store => store.userModule.user)
  
  // Get the post from store or use propPost if available
  const storePost = posts.find(p => p._id === postId)
  const post = propPost || storePost
  
  // Validate post ownership when modal opens
  useEffect(() => {
    if (isOpen && post) {
      console.log('🔍 CommentsModal: Validating post ownership')
      console.log('🔍 Post owner ID:', post.owner?._id)
      console.log('🔍 Post ID:', post._id)
      
      if (!post.owner?._id) {
        console.error('❌ CommentsModal: Post has no owner!')
        onClose()
        return
      }
    }
  }, [isOpen, post, onClose])
  
  // Load comments for this post when modal opens
  useEffect(() => {
    if (isOpen && post?._id) {
      console.log('🔄 Loading comments for post:', post._id)
      dispatch(loadComments(post._id))
    }
  }, [isOpen, post?._id, dispatch])

  // Update time display every minute
  useEffect(() => {
    if (!isOpen) return
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isOpen])

  // Listen for avatar updates to refresh post owner data
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      const { updatedUser } = event.detail
      if (updatedUser && post.owner && updatedUser._id === post.owner._id) {
        console.log('🔄 CommentsModal: Avatar updated for post owner, refreshing comments')
        // Reload comments to get updated owner data
        dispatch(loadComments(post._id))
      }
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate)
    }
  }, [post.owner?._id, post._id, dispatch])

  // Handle image loading states
  useEffect(() => {
    if (isOpen && post?.imgUrl) {
      setImageLoading(true)
      setImageError(false)
    }
  }, [isOpen, post?.imgUrl])

  const handleKeyDown = useCallback((e) => {
    // Check if user is typing in input fields
    const el = e.target
    const isTyping = 
      el?.tagName === 'INPUT' ||
      el?.tagName === 'TEXTAREA' ||
      el?.isContentEditable ||
      el?.contentEditable === 'true'
    
    // Don't interfere with typing
    if (isTyping) return
    
    if (e.key === 'Escape') {
      if (isZoomed) {
        setIsZoomed(false)
        setImagePosition({ x: 0, y: 0 })
      } else {
        onClose()
      }
    } else if (e.key === '+' || e.key === '=') {
      // Zoom in
      if (!isZoomed) {
        setIsZoomed(true)
      }
    } else if (e.key === '-') {
      // Zoom out
      if (isZoomed) {
        setIsZoomed(false)
        setImagePosition({ x: 0, y: 0 })
      }
    } else if (e.key === 'r' || e.key === 'R') {
      // Reset position
      setImagePosition({ x: 0, y: 0 })
    } else if (e.key === 'ArrowLeft') {
      // Move left
      setImagePosition(prev => ({ ...prev, x: prev.x + 20 }))
    } else if (e.key === 'ArrowRight') {
      // Move right
      setImagePosition(prev => ({ ...prev, x: prev.x - 20 }))
    } else if (e.key === 'ArrowUp') {
      // Move up
      setImagePosition(prev => ({ ...prev, y: prev.y + 20 }))
    } else if (e.key === 'ArrowDown') {
      // Move down
      setImagePosition(prev => ({ ...prev, y: prev.y - 20 }))
    } else if (e.key === 'PageUp') {
      // Move up faster
      setImagePosition(prev => ({ ...prev, y: prev.y + 50 }))
    } else if (e.key === 'PageDown') {
      // Move down faster
      setImagePosition(prev => ({ ...prev, y: prev.y - 50 }))
    } else if (e.key === 'Home') {
      // Move to top-left
      setImagePosition({ x: 0, y: 0 })
    } else if (e.key === 'End') {
      // Move to bottom-right
      setImagePosition({ x: -100, y: -100 })
    }
  }, [isZoomed, onClose])

  // Handle keyboard events
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleKeyDown])

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const handleImageClick = () => {
    setIsZoomed(!isZoomed)
  }

  const handleImageDoubleClick = (e) => {
    e.preventDefault()
    setIsZoomed(!isZoomed)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setTouchStart(e.touches[0].clientX)
      
      if (isZoomed) {
        setDragStart({
          x: e.touches[0].clientX - imagePosition.x,
          y: e.touches[0].clientY - imagePosition.y
        })
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    
    // If swipe is significant enough, toggle zoom
    if (Math.abs(diff) < 10) {
      setIsZoomed(!isZoomed)
    }
    
    setTouchStart(null)
    setDragStart(null)
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      if (!pinchStart) {
        setPinchStart({
          distance: Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          )
        })
      } else {
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        
        const scale = currentDistance / pinchStart.distance
        
        if (scale > 1.2) {
          setIsZoomed(true)
        } else if (scale < 0.8) {
          setIsZoomed(false)
        }
      }
    } else if (e.touches.length === 1 && dragStart && isZoomed) {
      // Single touch drag
      setImagePosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    
    if (e.ctrlKey) {
      // Ctrl + scroll for fine zoom control
      if (e.deltaY < 0) {
        // Scroll up - zoom in
        if (!isZoomed) {
          setIsZoomed(true)
        }
      } else {
        // Scroll down - zoom out
        if (isZoomed) {
          setIsZoomed(false)
        }
      }
    } else if (e.shiftKey) {
      // Shift + scroll for horizontal movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaY * 0.5,
          y: prev.y
        }))
      }
    } else if (e.altKey) {
      // Alt + scroll for vertical movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x,
          y: prev.y - e.deltaY * 0.5
        }))
      }
    } else if (e.metaKey) {
      // Meta + scroll for fast movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 2,
          y: prev.y - e.deltaY * 2
        }))
      }
    } else if (e.ctrlKey && e.altKey) {
      // Ctrl + Alt + scroll for slow movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 0.1,
          y: prev.y - e.deltaY * 0.1
        }))
      }
    } else if (e.ctrlKey && e.shiftKey) {
      // Ctrl + Shift + scroll for slow horizontal movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaY * 0.1,
          y: prev.y
        }))
      }
    } else if (e.ctrlKey && e.altKey && e.shiftKey) {
      // Ctrl + Alt + Shift + scroll for slow vertical movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x,
          y: prev.y - e.deltaY * 0.1
        }))
      }
    } else if (e.metaKey && e.altKey) {
      // Meta + Alt + scroll for fast horizontal movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaY * 2,
          y: prev.y
        }))
      }
    } else if (e.metaKey && e.shiftKey) {
      // Meta + Shift + scroll for fast vertical movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x,
          y: prev.y - e.deltaY * 2
        }))
      }
    } else if (e.metaKey && e.altKey && e.shiftKey) {
      // Meta + Alt + Shift + scroll for fast slow movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 0.05,
          y: prev.y - e.deltaY * 0.05
        }))
      }
    } else if (e.ctrlKey && e.metaKey) {
      // Ctrl + Meta + scroll for fast slow movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 0.05,
          y: prev.y - e.deltaY * 0.05
        }))
      }
    } else if (e.ctrlKey && e.metaKey && e.altKey) {
      // Ctrl + Meta + Alt + scroll for fast slow movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 0.05,
          y: prev.y - e.deltaY * 0.05
        }))
      }
    } else if (e.ctrlKey && e.metaKey && e.altKey && e.shiftKey) {
      // Ctrl + Meta + Alt + Shift + scroll for fast slow movement
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 0.05,
          y: prev.y - e.deltaY * 0.05
        }))
      }
    } else {
      // Regular scroll for position control
      if (isZoomed) {
        setImagePosition(prev => ({
          x: prev.x - e.deltaX * 0.5,
          y: prev.y - e.deltaY * 0.5
        }))
      }
    }
  }

  const handleMouseDown = (e) => {
    if (isZoomed) {
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (dragStart && isZoomed) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setDragStart(null)
  }

  
  // Check if post exists
  if (!post) {
    return null
  }
  
  const postComments = getPostComments(postId, comments)
  const isLiked = isLikedByMe(loggedinUser?._id, post)
  const likeCount = getLikeCount(post)
  
  console.log('📊 Post comments count:', postComments.length, 'for post:', post._id)
  console.log('📋 Comments data:', postComments)

  function handleAddComment() {
    if (!newComment.trim()) return
    console.log('➕ Adding comment to post:', post._id, 'Text:', newComment)
    dispatch(addComment(post._id, newComment))
    setNewComment('')
  }

  function handleCommentKeyDown(e) {
    if (e.key === 'Enter') {
      handleAddComment()
    }
  }

  function handleUserClick(userId) {
    console.log('🔗 CommentsModal: Navigating to profile with userId:', userId)
    
    // Validate userId is not empty
    if (!userId || userId.trim() === '') {
      console.error('❌ CommentsModal: Empty userId provided')
      return
    }
    
    navigate(`/profile/${userId}`)
  }

  // Handle like/unlike toggle
  async function handleLike() {
    if (!loggedinUser) {
      console.log('❌ User not logged in')
      return
    }

    try {
      if (isLiked) {
        console.log('💔 Removing like from post:', postId)
        await dispatch(removePostLike(postId))
      } else {
        console.log('❤️ Adding like to post:', postId)
        await dispatch(addPostLike(postId))
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error)
    }
  }


  if (!isOpen) return null

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div className="instagram-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* צד שמאל - התמונה/וידיאו */}
        <div className={`modal-image-section ${imageLoading ? 'loading' : ''} ${isZoomed ? 'zoomed' : ''}`}>
          {imageError ? (
            <div className="image-error">
              <div className="error-icon">📷</div>
              <p>Failed to load media</p>
            </div>
          ) : post.type === 'video' ? (
            <VideoPlayer
              src={post.videoUrl}
              poster={post.posterUrl}
              duration={post.duration}
              width="100%"
              height="100%"
              className="modal-post-video"
              onPlay={() => setImageLoading(false)}
              onPause={() => {}}
              onEnded={() => {}}
            />
          ) : (
            <img 
              src={post.imgUrl} 
              alt="Post" 
              className="modal-post-image" 
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={handleImageClick}
              onDoubleClick={handleImageDoubleClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ 
                opacity: imageLoading ? 0 : 1,
                cursor: isZoomed ? 'grab' : 'pointer',
                transform: isZoomed ? `translate(${imagePosition.x}px, ${imagePosition.y}px)` : 'none'
              }}
              title="Click, double-tap, or scroll to zoom"
            />
          )}
        </div>

        {/* צד ימין - התגובות והאינטראקציות */}
        <div className="modal-comments-section">
          
          {/* כותרת הפוסט */}
          <div className="modal-post-header">
            <img 
              className="modal-user-img" 
              src={post.owner?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
              alt={post.owner?.username || post.owner?.fullname || 'משתמש'}
              onClick={() => handleUserClick(post.owner?._id)}
              style={{ cursor: 'pointer' }}
            />
            <div className="modal-user-info">
              <span 
                className="modal-username"
                onClick={() => handleUserClick(post.owner?._id)}
                style={{ cursor: 'pointer' }}
              >
                {post.owner?.username || post.owner?.fullname || 'משתמש'}
              </span>
              <span className="modal-post-time">
                {getTimeAgo(post.createdAt)}
              </span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>✖</button>
          </div>

          {/* תגובות */}
          <div className="modal-comments-container">
            {postComments.length > 0 ? (
              postComments.map((comment) => (
                <div key={comment._id} className="modal-comment-item">
                  <img 
                    className="modal-comment-user-img" 
                    src={comment.by.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
                    alt={comment.by.username || comment.by.fullname || 'משתמש'}
                    onClick={() => handleUserClick(comment.by._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="modal-comment-content">
                    <div className="modal-comment-header">
                      <span 
                        className="modal-comment-username"
                        onClick={() => handleUserClick(comment.by._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {comment.by.username || comment.by.fullname || 'משתמש'}
                      </span>
                      <span className="modal-comment-time">
                        {comment.createdAt ? getRelativeTime(comment.createdAt, currentTime) : 'עכשיו'}
                      </span>
                    </div>
                    <p className="modal-comment-text">{comment.txt}</p>
                    {comment.likedBy && comment.likedBy.length > 0 && (
                      <span className="modal-comment-likes">{comment.likedBy.length} likes</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="modal-no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>

          {/* כפתורי אינטראקציה */}
          <div className="modal-actions">
            <button 
              className={`modal-action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label={isLiked ? 'הסר לייק' : 'הוסף לייק'}
            >
              <svg 
                fill={isLiked ? "#ed4956" : "none"} 
                height="24" 
                viewBox="0 0 24 24" 
                width="24"
              >
                <path 
                  d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" 
                  stroke={isLiked ? "#ed4956" : "#262626"} 
                  strokeWidth="1.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round">
                </path>
              </svg>
            </button>
            <button className="modal-action-btn">
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" 
                  stroke="#262626" 
                  strokeLinejoin="round" 
                  strokeWidth="1.6" 
                  strokeLinecap="round">
                </path>
              </svg>
            </button>
            <button className="modal-action-btn">
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M13.973 20.046 21.77 6.928C22.8 5.195 21.55 3 19.535 3H4.466C2.138 3 .984 5.825 2.646 7.456l4.842 4.752 1.723 7.121c.548 2.266 3.571 2.721 4.762.717Z" 
                  stroke="#262626" 
                  strokeLinejoin="round" 
                  strokeWidth="1.6" 
                  strokeLinecap="round">
                </path>
                <line stroke="#262626" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.6" 
                  x1="7.488" 
                  x2="15.515" 
                  y1="12.208" 
                  y2="7.641">
                </line>
              </svg>
            </button>
            <button className="modal-action-btn modal-save-btn">
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
                <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" 
                  stroke="#262626" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.6">
                </polygon>
              </svg>
            </button>
          </div>

          {/* לייקים */}
          <div className="modal-likes">
            <p>{likeCount} likes</p>
          </div>

          {/* כיתוב הפוסט */}
          <div className="modal-post-caption">
            <p>
              <span 
                className="modal-caption-username"
                onClick={() => handleUserClick(post.owner?._id)}
                style={{ cursor: 'pointer' }}
              >
                {post.owner?.username || post.owner?.fullname || 'משתמש'}
              </span> 
              {post.txt}
            </p>
          </div>

          {/* הוספת תגובה */}
          <div className="modal-add-comment">
            <TextInputWithEmoji
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleCommentKeyDown}
              placeholder="Add a comment..."
              className="modal-comment-input"
              rows={1}
              emojiPosition="top-right"
            />
            <button 
              onClick={handleAddComment}
              className="modal-post-btn"
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
