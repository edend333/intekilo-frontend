import { useState, useEffect, useCallback, useRef } from 'react'
import { postService } from '../services/post/post.service'

export function useInfiniteScroll() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [nextCursor, setNextCursor] = useState('')
  const [isEmpty, setIsEmpty] = useState(false)
  
  const observer = useRef(null)
  const lastElementRef = useRef(null)

  // Listen for like events from Redux actions
  useEffect(() => {
    const handlePostLikeAdded = (event) => {
      const { postId, like } = event.detail
      console.log('📡 useInfiniteScroll: Received postLikeAdded event for post:', postId)
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, likedBy: [...(post.likedBy || []), like] }
            : post
        )
      )
    }

    const handlePostLikeRemoved = (event) => {
      const { postId, userId } = event.detail
      console.log('📡 useInfiniteScroll: Received postLikeRemoved event for post:', postId)
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, likedBy: (post.likedBy || []).filter(like => like._id !== userId) }
            : post
        )
      )
    }

    window.addEventListener('postLikeAdded', handlePostLikeAdded)
    window.addEventListener('postLikeRemoved', handlePostLikeRemoved)

    return () => {
      window.removeEventListener('postLikeAdded', handlePostLikeAdded)
      window.removeEventListener('postLikeRemoved', handlePostLikeRemoved)
    }
  }, [])

  // Load initial posts
  const loadInitialPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading initial posts...')
      
      const result = await postService.queryFeed('', 3)
      console.log('📊 Initial posts result:', result)
      
      if (result.posts && result.posts.length > 0) {
        setPosts(result.posts)
        setHasMore(result.hasMore)
        setNextCursor(result.nextCursor || '')
        setIsEmpty(false)
      } else {
        setPosts([])
        setHasMore(false)
        setNextCursor('')
        setIsEmpty(true)
      }
    } catch (err) {
      console.error('❌ Error loading initial posts:', err)
      setError(err.message || 'Failed to load posts')
      setPosts([])
      setIsEmpty(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return
    
    try {
      setLoadingMore(true)
      setError(null)
      console.log('🔄 Loading more posts with cursor:', nextCursor)
      
      const result = await postService.queryFeed(nextCursor, 3)
      console.log('📊 More posts result:', result)
      
      if (result.posts && result.posts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...result.posts])
        setHasMore(result.hasMore)
        setNextCursor(result.nextCursor || '')
      } else {
        setHasMore(false)
        setNextCursor('')
      }
    } catch (err) {
      console.error('❌ Error loading more posts:', err)
      setError(err.message || 'Failed to load more posts')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, nextCursor])

  // Intersection observer callback
  const lastElementCallback = useCallback((node) => {
    if (loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          console.log('👀 Last element visible, loading more posts...')
          loadMorePosts()
        }
      },
      {
        root: null,
        rootMargin: '100px 0px 0px 0px',
        threshold: 0.1,
      }
    )
    
    if (node) {
      observer.current.observe(node)
      lastElementRef.current = node
    }
  }, [hasMore, loadingMore, loadMorePosts])

  // Initialize posts on mount
  useEffect(() => {
    loadInitialPosts()
  }, [loadInitialPosts])

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  // Refresh posts (useful for when user follows/unfollows someone)
  const refreshPosts = useCallback(async () => {
    console.log('🔄 Refreshing posts...')
    await loadInitialPosts()
  }, [loadInitialPosts])

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    isEmpty,
    lastElementRef: lastElementCallback,
    refreshPosts,
  }
}
