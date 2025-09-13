import { useState, useEffect } from 'react'
import { PostPreview } from './PostPreview.jsx'
import { useScroll } from '../../customHooks/useScroll.js'
import { useNavigate } from 'react-router'
import { api } from '../../lib/api.js'
import { useDispatch } from 'react-redux'
import { loadAllComments } from '../../store/comments/comment.actions'

export function PostList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true)
        const postsData = await api('/api/post')
        setPosts(postsData)
        
        // טען תגובות אוטומטית
        dispatch(loadAllComments())
      } catch (error) {
        console.error('❌ PostList: Failed to load posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [dispatch])

  const lastElementRef = useScroll(() => {
    // בעתיד, כאן תקרי לשרת עם page/limit מהפג'ינציה בצד שרת
  })

  if (loading) return <div>Loading posts...</div>
  if (!posts?.length) return <div>No posts found</div>

  return (
    <>
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
