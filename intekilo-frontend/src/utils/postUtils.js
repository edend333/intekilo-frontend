/**
 * Utility functions for post operations
 */

/**
 * Check if a post is liked by a specific user
 * @param {string} currentUserId - The ID of the current user
 * @param {Object} post - The post object
 * @returns {boolean} - True if the post is liked by the current user
 */
export function isLikedByMe(currentUserId, post) {
  if (!currentUserId || !post || !post.likedBy) {
    return false
  }
  
  return post.likedBy.some(like => like._id === currentUserId)
}

/**
 * Get the like count for a post
 * @param {Object} post - The post object
 * @returns {number} - The number of likes
 */
export function getLikeCount(post) {
  if (!post || !post.likedBy) {
    return 0
  }
  
  return post.likedBy.length
}

/**
 * Get the comment count for a post
 * @param {string} postId - The post ID
 * @param {Array} comments - Array of all comments
 * @returns {number} - The number of comments for this post
 */
export function getCommentCount(postId, comments) {
  if (!postId || !comments) {
    return 0
  }
  
  return comments.filter(comment => comment.postId === postId).length
}

/**
 * Get comments for a specific post
 * @param {string} postId - The post ID
 * @param {Array} comments - Array of all comments
 * @returns {Array} - Array of comments for this post
 */
export function getPostComments(postId, comments) {
  if (!postId || !comments) {
    return []
  }
  
  return comments.filter(comment => comment.postId === postId)
}

/**
 * Format time relative to now
 * @param {number|string} timestamp - The timestamp to format
 * @param {number} currentTime - Current time in milliseconds
 * @returns {string} - Formatted time string
 */
export function getRelativeTime(timestamp, currentTime = Date.now()) {
  const commentTime = new Date(timestamp)
  const diffInSeconds = Math.floor((currentTime - commentTime.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'עכשיו'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `לפני ${minutes} דקות`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `לפני ${hours} שעות`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `לפני ${days} ימים`
  } else {
    return commentTime.toLocaleDateString('he-IL')
  }
}
