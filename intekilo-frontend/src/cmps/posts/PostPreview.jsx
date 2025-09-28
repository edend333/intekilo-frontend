import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { addComment } from '../../store/comments/comment.actions';
import { addPostLike, removePostLike, removePost } from '../../store/posts/post.actions';
import { updateUser } from '../../store/user.actions';
import { userService } from '../../services/user';
import { CommentsModal } from '../CommentsModal.jsx'
import { VideoPlayer } from '../VideoPlayer.jsx'
import { isLikedByMe, getLikeCount, getCommentCount } from '../../utils/postUtils'
import { getTimeAgo } from '../../utils/timeUtils'

export function PostPreview({ post, onOpenPost }) {

    const [txt, setTxt] = useState('')
    const [showCommentsModal, setShowCommentsModal] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const [isInViewport, setIsInViewport] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const postRef = useRef(null)
    const menuRef = useRef(null)
    const videoRef = useRef(null)
    const comments = useSelector(store => store.commentModule.comments)
    const loggedinUser = useSelector(store => store.userModule.user)
    const posts = useSelector(store => store.postModule.posts)
    
    // Get the updated post from store (in case likes changed)
    const currentPost = posts.find(p => p._id === post._id)
    const postToDisplay = currentPost || post
    
    // Debug: Log when post is not found in store (might be deleted)
    if (!currentPost && posts.length > 0) {
        console.log('⚠️ Post not found in store:', post._id)
        console.log('⚠️ Available post IDs:', posts.map(p => p._id))
        // If post is not found in store, it might have been deleted
        // Return null to prevent rendering
        return null
    }
    const commentCount = getCommentCount(postToDisplay._id, comments)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Check if current user liked this post
    const isLiked = isLikedByMe(loggedinUser?._id, postToDisplay)

    // Check if current user saved this post
    useEffect(() => {
        if (loggedinUser?.savedPostIds) {
            const isPostSaved = loggedinUser.savedPostIds.some(savedId => 
                savedId.toString() === postToDisplay._id.toString()
            )
            setIsSaved(isPostSaved)
        } else {
            setIsSaved(false)
        }
    }, [loggedinUser?.savedPostIds, postToDisplay._id])

    // Intersection Observer for viewport detection
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isVisible = entry.isIntersecting
                setIsInViewport(isVisible)
                // Pause video when not in viewport
                if (!isVisible && videoRef.current) {
                    videoRef.current.pause()
                    setIsVideoPlaying(false)
                }
            },
            { threshold: 0.5 } // Trigger when 50% of the post is visible
        )

        if (postRef.current) {
            observer.observe(postRef.current)
        }

        return () => {
            if (postRef.current) {
                observer.unobserve(postRef.current)
            }
        }
    }, [isVideoPlaying])

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

    // Listen for avatar updates to refresh post owner data
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { updatedUser } = event.detail
            if (updatedUser && post.owner && updatedUser._id === post.owner._id) {
                console.log('🔄 PostPreview: Avatar updated for post owner, refreshing post data')
                // Force re-render by updating the post object
                // The parent component should handle this, but we can trigger a re-render
                window.dispatchEvent(new CustomEvent('postDataRefresh', { 
                    detail: { postId: post._id, updatedUser } 
                }))
            }
        }

        window.addEventListener('avatarUpdated', handleAvatarUpdate)
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate)
        }
    }, [post.owner?._id, post._id])

    function handleAddComment() {
        if (!txt.trim()) return
        dispatch(addComment(post._id, txt))
        setTxt('')
    }

    function handleLike() {
        if (!loggedinUser) {
            console.log('❌ User not logged in')
            return
        }

        console.log('💖 handleLike called - isLiked:', isLiked, 'postId:', post._id)
        
        if (isLiked) {
            dispatch(removePostLike(post._id))
        } else {
            dispatch(addPostLike(post._id))
        }
    }

    function handleViewComments() {
        setShowCommentsModal(true)
    }

    function handleUserClick(userId) {
        console.log('🔗 PostPreview: Navigating to profile with userId:', userId)
        console.log('🔗 PostPreview: Post owner ID:', post.owner?._id)
        
        // Validate that the userId matches the post owner
        if (userId !== post.owner?._id) {
            console.error('❌ PostPreview: UserId mismatch!', {
                clickedUserId: userId,
                postOwnerId: post.owner?._id
            })
            // Use the post owner ID instead
            navigate(`/profile/${post.owner._id}`)
        } else {
            navigate(`/profile/${userId}`)
        }
    }

    async function handleSaveToggle() {
        if (!loggedinUser) {
            // Open login modal or redirect to login
            navigate('/login')
            return
        }

        if (isSaving) return

        setIsSaving(true)
        
        try {
            // Optimistic UI update
            setIsSaved(!isSaved)
            
            let updatedUser
            if (isSaved) {
                // Remove from saved
                updatedUser = await userService.removeSavedPost(post._id)
            } else {
                // Add to saved
                updatedUser = await userService.addSavedPost(post._id)
            }
            
            // Update Redux store
            dispatch(updateUser(updatedUser))
            console.log('✅ PostPreview: Save toggle successful, updated user:', updatedUser)
        } catch (error) {
            console.error('Error toggling save:', error)
            // Revert optimistic update
            setIsSaved(isSaved)
            // Show error message
            alert('לא ניתן לשמור כרגע. נסה שוב.')
        } finally {
            setIsSaving(false)
        }
    }

  useEffect(() => {
    // Comments loaded
  }, [comments])

    // Video event handlers
    const handleVideoPlay = () => {
        setIsVideoPlaying(true)
    }

    const handleVideoPause = () => {
        setIsVideoPlaying(false)
    }

    const handleVideoEnded = () => {
        setIsVideoPlaying(false)
    }

    const handleDeletePost = async () => {
        if (isDeleting) return
        
        setIsDeleting(true)
        try {
            console.log('🗑️ Deleting post:', post._id)
            console.log('🗑️ Post data:', { _id: post._id, txt: post.txt })
            
            await dispatch(removePost(post._id))
            
            // Close dialogs and menu
            setShowDeleteDialog(false)
            setShowMenu(false)
            
            // Show success message
            console.log('✅ Post deleted successfully')
        } catch (error) {
            console.error('❌ Error deleting post:', error)
            // Show error message
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCancelDelete = () => {
        setShowDeleteDialog(false)
    }

    const handleEditPost = () => {
        setShowEditModal(true)
        setShowMenu(false)
    }

    const handleMenuToggle = () => {
        setShowMenu(!showMenu)
    }

    return (
        <>
            <article className="post-preview" ref={postRef}>
                <header className="post-header">
                    <img 
                        className="user-img" 
                        src={post.owner?.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} 
                        alt="User" 
                        onClick={() => handleUserClick(post.owner?._id)}
                        style={{ cursor: 'pointer' }}
                    />
                    <div className="post-header-info">
                        <span 
                            className="username" 
                            onClick={() => handleUserClick(post.owner?._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {post.owner?.username || post.owner?.fullname || 'משתמש'}
                        </span>
                        <span className="post-time">
                            {getTimeAgo(post.createdAt)}
                        </span>
                    </div>
                    <div className="post-menu" ref={menuRef}>
                        <span 
                            className="dot-menu" 
                            onClick={handleMenuToggle}
                        >
                            •••
                        </span>
                        {loggedinUser?._id === post.owner?._id && showMenu && (
                            <div className="menu-dropdown">
                                <button 
                                    className="menu-item edit-btn"
                                    onClick={handleEditPost}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                    עריכת פוסט
                                </button>
                                <button 
                                    className="menu-item delete-btn"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                    מחק פוסט
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {post.type === 'video' ? (
                    <VideoPlayer
                        ref={videoRef}
                        src={post.videoUrl}
                        poster={post.posterUrl}
                        duration={post.duration}
                        width="100%"
                        height="auto"
                        autoPlay={isInViewport}
                        muted={true}
                        onPlay={handleVideoPlay}
                        onPause={handleVideoPause}
                        onEnded={handleVideoEnded}
                        className="post-video"
                    />
                ) : (
                    <img className="post-img" src={post.imgUrl} alt="Post" />
                )}

                <section className="post-actions">
                    <div className="left-icons">
                        <button 
                            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} 
                            aria-label={isLiked ? "Unlike" : "Like"} 
                            onClick={handleLike}
                        >
                            {isLiked ? (
                                <svg fill="#ed4956" height="24" viewBox="0 0 24 24" width="24" className="like-icon-filled">
                                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                                </svg>
                            ) : (
                                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" className="like-icon-outline">
                                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" 
                                    stroke="#262626" 
                                    strokeWidth="1.6" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round">
                                </path>
                            </svg>
                        )}
                    </button>

                    <button className="action-btn" aria-label="Comment" onClick={handleViewComments}>
                        <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" 
                                stroke="#262626" 
                                strokeLinejoin="round" 
                                strokeWidth="1.6" 
                                strokeLinecap="round">
                            </path>
                        </svg>
                    </button>

                    <button className="action-btn" aria-label="Share">
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
                </div>

                <div className="right-icon">
                    <button 
                        className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={handleSaveToggle}
                        disabled={isSaving}
                        aria-label={isSaved ? "הסר שמירה" : "שמור"}
                        aria-pressed={isSaved}
                        title={isSaved ? "הסר שמירה" : "שמור"}
                    >
                        <svg 
                            fill={isSaved ? "#D4AF37" : "none"} 
                            height="24" 
                            viewBox="0 0 24 24" 
                            width="24"
                        >
                            <polygon 
                                points="20 21 12 13.44 4 21 4 3 20 3 20 21" 
                                stroke={isSaved ? "#D4AF37" : "#262626"} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="1.6"
                            >
                            </polygon>
                        </svg>
                    </button>
                </div>
            </section>

            <section className="post-meta">
                {getLikeCount(currentPost) > 0 && (
                    <p>{getLikeCount(currentPost)} likes</p>
                )}
                {commentCount > 0 && (
                    <p className="view-comments" onClick={handleViewComments}>
                        View all {commentCount} comments
                    </p>
                )}
            </section>

            <section className="post-details">
                <p>
                    <span 
                        className="username" 
                        onClick={() => handleUserClick(post.owner?._id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {post.owner?.username || post.owner?.fullname || 'משתמש'}
                    </span> {post.txt}
                </p>
            </section>

            <section className="comment-input">
                <input type="text"
                 placeholder="Add a comment..." 
                                     value={txt}
                    onChange={(e) => setTxt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment()
                    }}
                />
                
            </section>
        </article>

        <CommentsModal 
            postId={post._id}
            isOpen={showCommentsModal}
            onClose={() => setShowCommentsModal(false)}
        />
        
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
                            onClick={handleDeletePost}
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
            <div className="edit-dialog-overlay" onClick={() => setShowEditModal(false)}>
                <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
                    <h3>עריכת פוסט</h3>
                    <div className="edit-form">
                        <textarea 
                            className="edit-textarea"
                            defaultValue={post.txt}
                            placeholder="מה אתה חושב?"
                            rows="4"
                        />
                        <div className="edit-buttons">
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowEditModal(false)}
                            >
                                בטל
                            </button>
                            <button 
                                className="save-btn"
                                onClick={() => {
                                    // TODO: Implement save functionality
                                    setShowEditModal(false)
                                }}
                            >
                                שמור
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}
