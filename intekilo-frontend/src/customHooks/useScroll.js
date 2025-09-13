import { useEffect, useRef, useCallback } from 'react'

export function useScroll(callback, options = {}) {
  const observer = useRef(null)

  const lastElementRef = useCallback(
    node => {
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            const pageHeight = document.documentElement.scrollHeight
            const viewportHeight = window.innerHeight

            if (pageHeight > viewportHeight) {
              // Last element reached
              callback()
            }
          }
        },
        {
          root: null,
          rootMargin: '0px 0px 100px 0px', 
          threshold: 0.1,
          ...options,
        }
      )

      if (node) observer.current.observe(node)
    },
    [callback, options]
  )

  return lastElementRef
}
