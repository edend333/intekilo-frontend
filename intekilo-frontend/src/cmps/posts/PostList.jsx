import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { PostPreview } from './PostPreview.jsx'
import { useScroll } from '../../customHooks/useScroll.js'
import { loadPosts } from '../../store/posts/post.actions.js'
import { useNavigate } from 'react-router'

export function PostList() {
  const navigate = useNavigate()
  const posts = useSelector(state => state.postModule.posts || [])

  useEffect(() => {
    // כאן תשלבי בעתיד את הקריאה לשרת עם page/limit
    loadPosts()
  }, [])

  const lastElementRef = useScroll(() => {
    // בעתיד, כאן תקרי לשרת עם page/limit מהפג'ינציה בצד שרת
    console.log('Reached bottom - load more from server')
  })

  if (!posts?.length) return <div>Loading posts...</div>

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
