import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { loadPostById } from '../store/posts/post.actions'

export function ModalPost() {
  const { postId } = useParams()
  const navigate = useNavigate()
const dispatch = useDispatch()
  const posts = useSelector((store) => store.postModule.posts)
  const comments = useSelector((store) => store.commentModule.comments)

  const post = posts.find((p) => p._id === postId)
useEffect(() => {
  if (!post && postId) {
    dispatch(loadPostById(postId)) 
  }
}, [postId, post])

  if (!post) return <div className="modal-overlay">Loading...</div>

  const postComments = comments.filter((c) => c.postId === postId)

  return (
    <div className="modal-overlay" onClick={() => navigate('/')}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-img-wrapper">
          <img src={post.imgUrl} alt="post" />
        </div>

        <div className="modal-info">
          <h4>{post.by?.fullname || post.username}</h4>
          <p>{post.txt || post.caption}</p>

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
