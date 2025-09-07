import { useState, useEffect } from 'react'
import { PostPreview } from './PostPreview.jsx'
import { useScroll } from '../../customHooks/useScroll.js'
import { useNavigate } from 'react-router'
import { api } from '../../lib/api.js'

export function PostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        console.log('🔄 PostList: Starting to load posts from server...')
        setLoading(true)
        const postsData = await api('/api/post')
        console.log('📊 PostList: Received posts from server:', postsData)
        console.log('📈 PostList: Number of posts:', postsData.length)
        setPosts(postsData)
      } catch (error) {
        console.error('❌ PostList: Failed to load posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [])

  const lastElementRef = useScroll(() => {
    // בעתיד, כאן תקרי לשרת עם page/limit מהפג'ינציה בצד שרת
    console.log('Reached bottom - load more from server')
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
