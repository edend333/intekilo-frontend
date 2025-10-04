import React from 'react'

export function PostSkeleton() {
  return (
    <div className="post-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-user-info">
          <div className="skeleton-username"></div>
          <div className="skeleton-timestamp"></div>
        </div>
      </div>
      
      <div className="skeleton-content">
        <div className="skeleton-text-line skeleton-text-line--long"></div>
        <div className="skeleton-text-line"></div>
        <div className="skeleton-text-line skeleton-text-line--short"></div>
      </div>
      
      <div className="skeleton-image"></div>
      
      <div className="skeleton-actions">
        <div className="skeleton-action"></div>
        <div className="skeleton-action"></div>
        <div className="skeleton-action"></div>
      </div>
    </div>
  )
}

export function PostListSkeleton({ count = 3 }) {
  return (
    <div className="post-list-skeleton">
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = 'medium' }) {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="spinner"></div>
      <span className="spinner-text">טוען פוסטים...</span>
    </div>
  )
}
