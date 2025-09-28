import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useRef } from 'react'
import { loadPostById } from '../store/posts/post.actions'
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
  const videoRef = useRef(null)

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

  return (
    <div className="modal-overlay" onClick={() => navigate('/')}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
            <h4>{currentPost.by?.fullname || currentPost.username}</h4>
            <span className="modal-time">{getTimeAgo(currentPost.createdAt)}</span>
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
    </div>
  )
}
