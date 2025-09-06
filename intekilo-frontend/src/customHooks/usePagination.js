import { useState, useCallback } from 'react'

export function usePagination({ fetchPage, limit = 10 }) {
  const [page, setPage] = useState(0)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadNext = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const newItems = await fetchPage(page, limit)
      setItems(prev => [...prev, ...newItems])
      setPage(prev => prev + 1)
      if (newItems.length < limit) setHasMore(false)
    } catch (err) {
      console.error('Pagination error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, isLoading, hasMore, fetchPage])

  return {
    items,
    isLoading,
    hasMore,
    loadNext,
  }
}
