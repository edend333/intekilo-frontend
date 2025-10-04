import { httpService } from '../http.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'
const STORAGE_KEY_LOGIN_TOKEN = 'loginToken'

// Cookie management functions
function _setCookie(name, value, days = 7) {
    let expires = ""
    if (days) {
        const date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; sameSite=Lax; secure=false"
}

function _getCookie(name) {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

function _deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=Lax; secure=false'
    document.cookie = name + '=; Path=/; Max-Age=0; sameSite=Lax; secure=false'
}

export const userService = {
	login,
	logout,
	signup,
	getUsers,
	getById,
	remove,
	update,
	updateBio,
	updateAvatar,
	addSavedPost,
	removeSavedPost,
	getSavedPosts,
    getLoggedinUser,
    validateToken,
    getLoginToken,
    saveLoginToken,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    removeFollower,
    getProfileWithCounts,
    getRelationships,
    getFollowingStats,
    getSuggestedUsers
}

function getUsers() {
	return httpService.get(`users`)
}

async function getById(userId) {
	try {
		return await httpService.get(`users/${userId}`)
	} catch (error) {
		if (error.response?.status === 404) {
			return null
		}
		throw error
	}
}

async function remove(userId) {
	return httpService.delete(`users/${userId}`)
}

async function update(user) {
	const updatedUser = await httpService.put(`users/${user._id}`, user)
	
	// If this is the logged-in user, update localStorage
	const loggedinUser = getLoggedinUser()
	if (loggedinUser && loggedinUser._id === user._id) {
		_saveLocalUser(updatedUser)
	}
	
	return updatedUser
}

async function updateBio(userId, bio) {
	return httpService.put(`users/${userId}/bio`, { bio })
}

// Follow/Unfollow functions
async function followUser(userId) {
	try {
		const response = await httpService.post(`users/${userId}/follow`)
		return response
	} catch (err) {
		throw err
	}
}

async function unfollowUser(userId) {
	try {
		const response = await httpService.delete(`users/${userId}/follow`)
		return response
	} catch (err) {
		throw err
	}
}

async function getFollowers(userId) {
	try {
		const followers = await httpService.get(`users/${userId}/followers`)
		return followers
	} catch (err) {
		throw err
	}
}

async function getFollowing(userId) {
	try {
		const following = await httpService.get(`users/${userId}/following`)
		return following
	} catch (err) {
		throw err
	}
}

async function isFollowing(userId) {
	try {
		const response = await httpService.get(`users/${userId}/is-following`)
		return response.isFollowing
	} catch (err) {
		throw err
	}
}

async function removeFollower(followerId) {
	try {
		const response = await httpService.delete(`users/${followerId}/follower`)
		return response
	} catch (err) {
		throw err
	}
}

async function login(userCred) {
	const response = await httpService.post('auth/login', userCred)
	if (response.user) {
		// Save the token from the response
		if (response.loginToken) {
			saveLoginToken(response.loginToken)
		}
		// Set authInitialized flag to prevent auto-logout issues
		localStorage.setItem('authInitialized', 'true')
		sessionStorage.setItem('authInitialized', 'true')
		return _saveLocalUser(response.user)
	}
}

async function signup(userCred) {
	if (!userCred.imgUrl) userCred.imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

	const response = await httpService.post('auth/signup', userCred)
	if (response.user) {
		// Save the token from the response
		if (response.loginToken) {
			saveLoginToken(response.loginToken)
		}
		// Set authInitialized flag to prevent auto-logout issues
		localStorage.setItem('authInitialized', 'true')
		sessionStorage.setItem('authInitialized', 'true')
		return _saveLocalUser(response.user)
	}
}

async function logout() {
	try {
		await httpService.post('auth/logout')
	} catch (err) {
		// Continue with client-side cleanup even if server fails
	}
	
	// Complete localStorage cleanup
	localStorage.removeItem('loggedinUser')
	localStorage.removeItem('loginToken')
	localStorage.removeItem('user')
	localStorage.removeItem('review')
	localStorage.removeItem('comment')
	localStorage.removeItem('authInitialized') // CRITICAL: prevents auto-reauth
	localStorage.removeItem('token')
	localStorage.removeItem('authToken')
	localStorage.removeItem('accessToken')
	// Additional cleanup for any other possible storage keys
	localStorage.removeItem('intekilo_onboarding')
	localStorage.removeItem('INTEKILO_STORAGE_KEY_PREFS')
	// Don't use localStorage.clear() as it might interfere with other apps

	// Complete sessionStorage cleanup
	sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
	sessionStorage.removeItem(STORAGE_KEY_LOGIN_TOKEN)
	sessionStorage.removeItem('authInitialized') // CRITICAL: prevents auto-reauth
	sessionStorage.removeItem('token')
	sessionStorage.removeItem('authToken')
	sessionStorage.removeItem('accessToken')
	// Don't use sessionStorage.clear() as it might interfere with other apps

	// Enhanced cookie cleanup
	_clearAllCookies()
}

function _clearAllCookies() {
	// Get current domain
	const domain = window.location.hostname
	const pathOptions = ['/', '/api', '/frontend']
	
	// Common cookie names we might have
	const cookieNames = [
		STORAGE_KEY_LOGGEDIN_USER, 
		STORAGE_KEY_LOGIN_TOKEN,
		'loginToken',
		'authInitialized',
		'loggedinUser',
		'loginToken'
	]
	
	// Clear cookies with different domain/path combinations
	cookieNames.forEach(name => {
		pathOptions.forEach(path => {
			// Clear for current domain
			document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
			document.cookie = `${name}=; Path=${path}; Max-Age=0; SameSite=Lax`
			document.cookie = `${name}=; Domain=${domain}; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
			document.cookie = `${name}=; Domain=${domain}; Path=${path}; Max-Age=0; SameSite=Lax`
			
			// Clear for parent domain (in case app is on subdomain)
			const domainParts = domain.split('.')
			if (domainParts.length > 1) {
				const parentDomain = '.' + domainParts.slice(-2).join('.')
				document.cookie = `${name}=; Domain=${parentDomain}; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
				document.cookie = `${name}=; Domain=${parentDomain}; Path=${path}; Max-Age=0; SameSite=Lax`
			}
		})
	})
}

function getLoggedinUser() {
    // Try localStorage first (persists across page refreshes)
    let user = localStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
    if (user) {
        return JSON.parse(user)
    }
    
    // If not in localStorage, try sessionStorage
    user = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
    if (user) {
        return JSON.parse(user)
    }
    
    // If not in sessionStorage, try cookie
    user = _getCookie(STORAGE_KEY_LOGGEDIN_USER)
    if (user) {
        const parsedUser = JSON.parse(user)
        return parsedUser
    }
    
    return null
}

async function validateToken() {
	try {
		const response = await httpService.get('auth/validate')
		if (response.valid) {
			return response.user
		}
	} catch (err) {
		throw err
	}
}

function getLoginToken() {
    // Try localStorage first (persists across page refreshes)
    let token = localStorage.getItem(STORAGE_KEY_LOGIN_TOKEN)
    
    if (token) {
        return token
    }
    
    // If not in localStorage, try sessionStorage
    token = sessionStorage.getItem(STORAGE_KEY_LOGIN_TOKEN)
    
    if (token) {
        return token
    }
    
    // If not in sessionStorage, try cookie
    token = _getCookie(STORAGE_KEY_LOGIN_TOKEN)
    
    if (token) {
        return token
    }
    
    return null
}

function saveLoginToken(token) {
    // Save to both localStorage and sessionStorage
    localStorage.setItem(STORAGE_KEY_LOGIN_TOKEN, token)
    sessionStorage.setItem(STORAGE_KEY_LOGIN_TOKEN, token)
    _setCookie(STORAGE_KEY_LOGIN_TOKEN, token, 1) // 1 day
}

function _saveLocalUser(user) {
    // 🛡️ Ensure user has proper default structure for follow functionality
    const userWithDefaults = {
        ...user,
        following: user.following || [],
        followingCount: user.followingCount || 0,
        followers: user.followers || [],
        followersCount: user.followersCount || 0
    }
    
    // Save to both localStorage and sessionStorage
    localStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userWithDefaults))
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userWithDefaults))
    _setCookie(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(userWithDefaults), 1) // 1 day
    return userWithDefaults
}

async function updateAvatar(avatarData) {
    try {
        const updatedUser = await httpService.patch('users/me/avatar', avatarData)
        _saveLocalUser(updatedUser)
        return updatedUser
    } catch (err) {
        console.error('Failed to update avatar:', err)
        throw err
    }
}

async function addSavedPost(postId) {
    try {
        const updatedUser = await httpService.put(`users/me/saved-posts/${postId}`)
        _saveLocalUser(updatedUser)
        return updatedUser
    } catch (err) {
        console.error('Failed to add saved post:', err)
        throw err
    }
}

async function removeSavedPost(postId) {
    try {
        const updatedUser = await httpService.delete(`users/me/saved-posts/${postId}`)
        _saveLocalUser(updatedUser)
        return updatedUser
    } catch (err) {
        console.error('Failed to remove saved post:', err)
        throw err
    }
}

async function getSavedPosts(offset = 0, limit = 20) {
    try {
        const savedPosts = await httpService.get(`users/me/saved-posts?offset=${offset}&limit=${limit}`)
        return savedPosts
    } catch (err) {
        console.error('Failed to get saved posts:', err)
        throw err
    }
}

async function getProfileWithCounts(userId) {
    try {
        const profileData = await httpService.get(`users/${userId}/profile`)
        return profileData
    } catch (err) {
        throw err
    }
}

async function getRelationships(profileId) {
    try {
        const relationships = await httpService.get(`users/relationships/${profileId}`)
        return relationships
    } catch (err) {
        throw err
    }
}

async function getFollowingStats(userId) {
    try {
        const stats = await httpService.get(`users/${userId}/following-stats`)
        return stats
    } catch (err) {
        throw err
    }
}

async function getSuggestedUsers(limit = 5) {
    try {
        const suggestedUsers = await httpService.get(`users/me/suggested?limit=${limit}`)
        return suggestedUsers
    } catch (err) {
        throw err
    }
}