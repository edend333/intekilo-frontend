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
    getProfileWithCounts
}

function getUsers() {
	return httpService.get(`users`)
}

async function getById(userId) {
	try {
		return await httpService.get(`users/${userId}`)
	} catch (error) {
		if (error.response?.status === 404) {
			console.log('❌ User not found with ID:', userId)
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
		console.log('👥 followUser called for user:', userId)
		console.log('📋 Request details:', {
			method: 'POST',
			url: `users/${userId}/follow`,
			userId: userId
		})
		
		const response = await httpService.post(`users/${userId}/follow`)
		console.log('✅ Follow successful:', response)
		return response
	} catch (err) {
		console.error('❌ Follow failed:', err)
		throw err
	}
}

async function unfollowUser(userId) {
	try {
		console.log('👥 unfollowUser called for user:', userId)
		const response = await httpService.delete(`users/${userId}/follow`)
		console.log('✅ Unfollow successful:', response)
		return response
	} catch (err) {
		console.error('❌ Unfollow failed:', err)
		throw err
	}
}

async function getFollowers(userId) {
	try {
		console.log('👥 getFollowers called for user:', userId)
		const followers = await httpService.get(`users/${userId}/followers`)
		console.log('📊 Found followers:', followers.length)
		return followers
	} catch (err) {
		console.error('❌ Get followers failed:', err)
		throw err
	}
}

async function getFollowing(userId) {
	try {
		console.log('👥 getFollowing called for user:', userId)
		const following = await httpService.get(`users/${userId}/following`)
		console.log('📊 Found following:', following.length)
		return following
	} catch (err) {
		console.error('❌ Get following failed:', err)
		throw err
	}
}

async function isFollowing(userId) {
	try {
		console.log('👥 isFollowing called for user:', userId)
		console.log('📋 Request details:', {
			method: 'GET',
			url: `users/${userId}/is-following`,
			userId: userId
		})
		
		const response = await httpService.get(`users/${userId}/is-following`)
		console.log('✅ isFollowing successful:', response)
		console.log('📊 Is following:', response.isFollowing)
		return response.isFollowing
	} catch (err) {
		console.error('❌ Check following failed:', err)
		throw err
	}
}

async function removeFollower(followerId) {
	try {
		console.log('👥 removeFollower called for follower:', followerId)
		const response = await httpService.delete(`users/${followerId}/follower`)
		console.log('✅ Remove follower successful:', response)
		return response
	} catch (err) {
		console.error('❌ Remove follower failed:', err)
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
		return _saveLocalUser(response.user)
	}
}

async function logout() {
	try {
		await httpService.post('auth/logout')
	} catch (err) {
		console.error('Server logout failed:', err)
		throw err
	}
	
	localStorage.removeItem('loggedinUser')
	localStorage.removeItem('loginToken')
	localStorage.removeItem('user')
	localStorage.removeItem('review')
	localStorage.removeItem('comment')
	localStorage.removeItem('authInitialized')
	localStorage.removeItem('token')
	localStorage.removeItem('authToken')
	localStorage.removeItem('accessToken')
	localStorage.clear()
	
	sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
	sessionStorage.removeItem(STORAGE_KEY_LOGIN_TOKEN)
	sessionStorage.removeItem('authInitialized')
	sessionStorage.removeItem('token')
	sessionStorage.removeItem('authToken')
	sessionStorage.removeItem('accessToken')
	sessionStorage.clear()
	
	document.cookie = STORAGE_KEY_LOGGEDIN_USER + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=Lax; secure=false'
	document.cookie = STORAGE_KEY_LOGIN_TOKEN + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=Lax; secure=false'
	document.cookie = STORAGE_KEY_LOGGEDIN_USER + '=; Path=/; Max-Age=0; sameSite=Lax; secure=false'
	document.cookie = STORAGE_KEY_LOGIN_TOKEN + '=; Path=/; Max-Age=0; sameSite=Lax; secure=false'
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
    // Save to both localStorage and sessionStorage
    localStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    _setCookie(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user), 1) // 1 day
    return user
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
        console.log('🔍 getProfileWithCounts called with userId:', userId)
        const profileData = await httpService.get(`users/${userId}/profile`)
        console.log('📊 Profile data with counts:', profileData)
        return profileData
    } catch (err) {
        console.error('Failed to get profile with counts:', err)
        throw err
    }
}