import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { PostPreview } from './PostPreview.jsx'
import { useScroll } from '../../customHooks/useScroll.js'
import { usePagination } from '../../customHooks/usePagination.js'
import { loadPosts } from '../../store/posts/post.actions.js'
import { ModalPost } from '../../pages/ModalPost.jsx'
import { useNavigate } from 'react-router'


export function PostList() {
  const navigate = useNavigate()
  const { items, isLoading, hasMore, loadNext } = usePagination({
    fetchPage: async (page, limit) => {
      const data = await loadPosts({ page, limit })
      console.log('fetchPage got:', data)
      return data
    },
    limit: 2,
  })


  // useEffect(() => {
  //   loadNext()
  // }, [])
  // useEffect(() => {
  //   console.log("items", items);

  //   // loadPosts({ page: 0})
  // }, [items])

useEffect(() => {
  if (items.length === 0) loadNext()
}, [])

  const lastElementRef = useScroll(() => {
    if (!isLoading && hasMore) {
      loadNext()
    }
  })

  

  if (!items?.length) return <div>Loading posts...</div>

  return (
    <>
      <ul className="post-list">
        {items.map((post, idx) => {
          const isLast = idx === items.length - 1
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
