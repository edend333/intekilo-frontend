import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useRef } from 'react'
import { loadPostById, removePost, updatePost } from '../store/posts/post.actions'
import { addPostLike, removePostLike } from '../store/posts/post.actions'
import { isLikedByMe, getLikeCount } from '../utils/postUtils'
import { VideoPlayer } from '../cmps/VideoPlayer'
import { getTimeAgo } from '../utils/timeUtils'

export function ModalPost() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const posts = useSelector((store) => store.postModule.posts)
  const comments = useSelector((store) => store.commentModule.comments)
  const loggedinUser = useSelector((store) => store.userModule.user)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const videoRef = useRef(null)
  const menuRef = useRef(null)

  // Get the updated post from store (in case likes changed)
  const currentPost = posts.find(p => p._id === postId)
  
  useEffect(() => {
    if (!currentPost && postId) {
      dispatch(loadPostById(postId)) 
    }
  }, [postId, currentPost])
  
  // Pause video when modal closes
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Handle ESC key for closing modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showEditModal) {
          setShowEditModal(false)
        } else if (showDeleteDialog) {
          setShowDeleteDialog(false)
        } else if (showMenu) {
          setShowMenu(false)
        } else {
          navigate('/')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showEditModal, showDeleteDialog, showMenu, navigate])

  // Initialize edit text when edit modal opens
  useEffect(() => {
    if (showEditModal && currentPost) {
      setEditText(currentPost.txt || currentPost.caption || '')
    }
  }, [showEditModal, currentPost])

  if (!currentPost) return <div className="modal-overlay">Loading...</div>

  const postComments = comments.filter((c) => c.postId === postId)
  
  // Check if current user liked this post
  const isLiked = isLikedByMe(loggedinUser?._id, currentPost)

  function handleLike() {
    if (!loggedinUser) {
      console.log('❌ User not logged in')
      return
    }
    if (isLikeLoading) {
      console.log('⚠️ Like request already in progress, skipping')
      return
    }
    console.log('💖 handleLike called - isLiked:', isLiked, 'postId:', currentPost._id)
    setIsLikeLoading(true)
    if (isLiked) {
      dispatch(removePostLike(currentPost._id)).finally(() => setIsLikeLoading(false))
    } else {
      dispatch(addPostLike(currentPost._id)).finally(() => setIsLikeLoading(false))
    }
  }

  // Check if current user owns this post
  const isOwner = loggedinUser && currentPost && (
    loggedinUser._id === currentPost.owner?._id || 
    loggedinUser._id === currentPost.by?._id ||
    loggedinUser.ROUL === 'admin'
  )

  const handleMenuToggle = () => {
    setShowMenu(!showMenu)
  }

  const handleEditPost = () => {
    setShowEditModal(true)
    setShowMenu(false)
  }

  const handleDeletePost = () => {
    setShowDeleteDialog(true)
    setShowMenu(false)
  }

  const handleConfirmDelete = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      await dispatch(removePost(currentPost._id))
      setShowDeleteDialog(false)
      navigate('/') // Close modal after successful deletion
    } catch (error) {
      console.error('❌ Error deleting post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
  }

  const handleSaveEdit = async () => {
    if (isEditing) return
    
    setIsEditing(true)
    try {
      const updatedPost = {
        ...currentPost,
        txt: editText.trim()
      }
      await dispatch(updatePost(updatedPost))
      setShowEditModal(false)
    } catch (error) {
      console.error('❌ Error updating post:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setEditText('')
  }

  return (
    <div className="modal-overlay" onClick={() => navigate('/')}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Fixed position menu button */}
        {isOwner && (
          <div className="modal-menu-container" ref={menuRef}>
            <button 
              className="menu-toggle-btn"
              onClick={handleMenuToggle}
              aria-label="פתח תפריט פעולות"
              aria-expanded={showMenu}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="1" fill="currentColor"/>
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="18" r="1" fill="currentColor"/>
              </svg>
            </button>
            
            {showMenu && (
              <div className="post-menu">
                <button 
                  className="menu-item edit-item"
                  onClick={handleEditPost}
                  aria-label="ערוך פוסט"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  ערוך
                </button>
                <button 
                  className="menu-item delete-item"
                  onClick={handleDeletePost}
                  aria-label="מחק פוסט"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  מחק
                </button>
              </div>
            )}
          </div>
        )}

        <div className="modal-img-wrapper">
          {currentPost.type === 'video' ? (
            <VideoPlayer
              ref={videoRef}
              src={currentPost.videoUrl}
              poster={currentPost.posterUrl}
              duration={currentPost.duration}
              width="100%"
              height="auto"
              muted={true}
              className="modal-video"
            />
          ) : (
            <img src={currentPost.imgUrl} alt="post" />
          )}
        </div>

        <div className="modal-info">
          <div className="modal-header">
            <div className="modal-header-left">
              <h4>{currentPost.by?.fullname || currentPost.username}</h4>
              <span className="modal-time">{getTimeAgo(currentPost.createdAt)}</span>
            </div>
          </div>
          <p>{currentPost.txt || currentPost.caption}</p>

          {/* Like button and count */}
          <div className="modal-actions">
            <button 
              className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} 
              aria-label={isLiked ? "Unlike" : "Like"} 
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              {isLiked ? (
                <svg fill="#ed4956" height="24" viewBox="0 0 24 24" width="24" className="like-icon-filled">
                  <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                </svg>
              ) : (
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" className="like-icon-outline">
                  <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" 
                  stroke="#262626" 
                  strokeWidth="1.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round">
                </path>
              </svg>
            )}
            </button>
          </div>

          {/* Like count */}
          {getLikeCount(currentPost) > 0 && (
            <p className="like-count">{getLikeCount(currentPost)} likes</p>
          )}

          <div className="comments">
            {postComments.length > 0 ? (
              postComments.map((c, idx) => (
                <p key={idx}>
                  <strong>{c.by}:</strong> {c.text}
                </p>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
        </div>

        <button className="close-btn" onClick={() => navigate('/')}>✖</button>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="delete-dialog-overlay" onClick={handleCancelDelete}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>למחוק את הפוסט?</h3>
            <p>הפעולה בלתי הפיכה.</p>
            <div className="dialog-buttons">
              <button 
                className="cancel-btn"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                בטל
              </button>
              <button 
                className="delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'מוחק...' : 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit post modal */}
      {showEditModal && (
        <div className="edit-dialog-overlay" onClick={handleCancelEdit}>
          <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>עריכת פוסט</h3>
            <div className="edit-form">
              <textarea 
                className="edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="מה אתה חושב?"
                rows="4"
                autoFocus
              />
              <div className="edit-buttons">
                <button 
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={isEditing}
                >
                  בטל
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSaveEdit}
                  disabled={isEditing || !editText.trim()}
                >
                  {isEditing ? 'שומר...' : 'שמור'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
