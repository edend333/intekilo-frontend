/**
 * Utility functions for time formatting and calculations
 */

/**
 * Calculate relative time from a given date
 * @param {Date|string|number} date - The date to calculate from
 * @returns {string} - Relative time string in Hebrew
 */
export function getTimeAgo(date) {
  if (!date) return 'לא ידוע'
  
  const now = new Date()
  const past = new Date(date)
  
  // Handle invalid dates
  if (isNaN(past.getTime())) {
    return 'לא ידוע'
  }
  
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  // Less than 60 seconds
  if (diffInSeconds < 60) {
    return 'הרגע'
  }
  
  // Less than 60 minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `לפני ${diffInMinutes} דק׳`
  }
  
  // Less than 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `לפני ${diffInHours} שעות`
  }
  
  // Check if it's yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  const pastStartOfDay = new Date(past)
  pastStartOfDay.setHours(0, 0, 0, 0)
  
  if (pastStartOfDay.getTime() === yesterday.getTime()) {
    return 'אתמול'
  }
  
  // Less than 7 days
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `לפני ${diffInDays} ימים`
  }
  
  // Less than 4 weeks (approximately 1 month)
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `לפני ${diffInWeeks} שבועות`
  }
  
  // Less than 12 months
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `לפני ${diffInMonths} חודשים`
  }
  
  // Years
  const diffInYears = Math.floor(diffInDays / 365)
  return `לפני ${diffInYears} שנים`
}

/**
 * Format date for display (fallback for very old posts)
 * @param {Date|string|number} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'לא ידוע'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'לא ידוע'
  
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Check if a date is today
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
  if (!date) return false
  
  const today = new Date()
  const checkDate = new Date(date)
  
  return today.toDateString() === checkDate.toDateString()
}

/**
 * Check if a date is yesterday
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} - True if the date is yesterday
 */
export function isYesterday(date) {
  if (!date) return false
  
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const checkDate = new Date(date)
  
  return yesterday.toDateString() === checkDate.toDateString()
}
