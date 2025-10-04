// Test script for following stats endpoint
const BASE_URL = 'http://localhost:3030/api'

async function testFollowingStats() {
    try {
        console.log('🧪 Testing following stats endpoint...')
        
        // Get the logged in user ID from localStorage (you'll need to run this in browser console)
        const userId = '68d798431b6c7c620f8e4730' // Replace with actual user ID
        
        const response = await fetch(`${BASE_URL}/users/${userId}/following-stats`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
            headers: {
                'Content-Type': 'application/json',
            }
        })
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(`HTTP ${response.status}: ${errorData.err || response.statusText}`)
        }
        
        const result = await response.json()
        console.log('✅ Following stats result:', result)
        
        return result
    } catch (error) {
        console.error('❌ Error testing following stats:', error)
        throw error
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testFollowingStats = testFollowingStats
}

module.exports = { testFollowingStats }
