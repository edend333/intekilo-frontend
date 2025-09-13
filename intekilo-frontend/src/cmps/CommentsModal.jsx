import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addComment } from '../store/comments/comment.actions'

export function CommentsModal({ post, isOpen, onClose }) {
  const [newComment, setNewComment] = useState('')
  const dispatch = useDispatch()
  const comments = useSelector(store => store.commentModule.comments)
  
  const postComments = comments.filter(comment => comment.postId === post._id)

  function handleAddComment() {
    if (!newComment.trim()) return
    dispatch(addComment(post._id, newComment))
    setNewComment('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleAddComment()
    }
  }

  if (!isOpen) return null

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div className="instagram-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* צד שמאל - התמונה */}
        <div className="modal-image-section">
          <img src={post.imgUrl} alt="Post" className="modal-post-image" />
        </div>

        {/* צד ימין - התגובות והאינטראקציות */}
        <div className="modal-comments-section">
          
          {/* כותרת הפוסט */}
          <div className="modal-post-header">
            <img className="modal-user-img" src={post.by.imgUrl} alt={post.by.fullname} />
            <span className="modal-username">{post.by.fullname}</span>
            <button className="modal-close-btn" onClick={onClose}>✖</button>
          </div>

          {/* תגובות */}
          <div className="modal-comments-container">
            {postComments.length > 0 ? (
              postComments.map((comment) => (
                <div key={comment._id} className="modal-comment-item">
                  <img 
                    className="modal-comment-user-img" 
                    src={comment.by.imgUrl} 
                    alt={comment.by.fullname} 
                  />
                  <div className="modal-comment-content">
                    <div className="modal-comment-header">
                      <span className="modal-comment-username">{comment.by.fullname}</span>
                      <span className="modal-comment-time">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'now'}
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
            <button className="modal-action-btn">
              <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" 
                  stroke="#262626" 
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
            <p>{post.likedBy ? post.likedBy.length : 0} likes</p>
          </div>

          {/* כיתוב הפוסט */}
          <div className="modal-post-caption">
            <p>
              <span className="modal-caption-username">{post.by.fullname}</span> 
              {post.txt}
            </p>
          </div>

          {/* הוספת תגובה */}
          <div className="modal-add-comment">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="modal-comment-input"
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
