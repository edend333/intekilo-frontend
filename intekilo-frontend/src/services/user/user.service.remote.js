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
    document.cookie = name + "=" + (value || "") + expires + "; path=/"
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
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

export const userService = {
	login,
	logout,
	signup,
	getUsers,
	getById,
	remove,
	update,
    getLoggedinUser,
    validateToken,
    getLoginToken,
    saveLoginToken,
}

function getUsers() {
	return httpService.get(`user`)
}

async function getById(userId) {
	const user = await httpService.get(`user/${userId}`)
	return user
}

function remove(userId) {
	return httpService.delete(`user/${userId}`)
}

async function update({ _id }) {
	const user = await httpService.put(`user/${_id}`, { _id })

	// When admin updates other user's details, do not update loggedinUser
    const loggedinUser = getLoggedinUser() // Might not work because its defined in the main service???
    if (loggedinUser._id === user._id) _saveLocalUser(user)

	return user
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
	sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
	sessionStorage.removeItem(STORAGE_KEY_LOGIN_TOKEN)
	sessionStorage.removeItem('authInitialized') // Clear auth initialization flag
	_deleteCookie(STORAGE_KEY_LOGGEDIN_USER)
	_deleteCookie(STORAGE_KEY_LOGIN_TOKEN)
	return await httpService.post('auth/logout')
}

function getLoggedinUser() {
    // Try sessionStorage first
    let user = sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER)
    if (user) {
        return JSON.parse(user)
    }
    
    // If not in sessionStorage, try cookie
    user = _getCookie(STORAGE_KEY_LOGGEDIN_USER)
    if (user) {
        const parsedUser = JSON.parse(user)
        // Save back to sessionStorage for faster access
        sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, user)
        return parsedUser
    }
    
    return null
}

async function validateToken() {
	try {
		const response = await httpService.get('auth/validate')
		if (response.valid) {
			return _saveLocalUser(response.user)
		} else {
			// Token is invalid, but don't clear local data immediately
			// Let the user continue with cached data until they try to make a request
			return null
		}
	} catch (err) {
		// Token validation failed, but don't clear local data immediately
		// Let the user continue with cached data until they try to make a request
		return null
	}
}

// Login token management functions
function getLoginToken() {
    // Try sessionStorage first
    let token = sessionStorage.getItem(STORAGE_KEY_LOGIN_TOKEN)
    if (token) {
        return token
    }
    
    // If not in sessionStorage, try cookie
    token = _getCookie(STORAGE_KEY_LOGIN_TOKEN)
    if (token) {
        // Save back to sessionStorage for faster access
        sessionStorage.setItem(STORAGE_KEY_LOGIN_TOKEN, token)
        return token
    }
    
    return null
}

function saveLoginToken(token) {
    // Save to both sessionStorage and cookie
    sessionStorage.setItem(STORAGE_KEY_LOGIN_TOKEN, token)
    _setCookie(STORAGE_KEY_LOGIN_TOKEN, token, 1) // 1 day (same as server)
}

function _saveLocalUser(user) {
	user = { 
		_id: user._id, 
		fullname: user.fullname, 
		imgUrl: user.imgUrl, 
		isAdmin: user.ROUL === 'admin' // Fix: Use ROUL instead of isAdmin
	}
	
	const userString = JSON.stringify(user)
	
	// Save to both sessionStorage and cookie
	sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, userString)
	_setCookie(STORAGE_KEY_LOGGEDIN_USER, userString, 7) // 7 days
	
	return user
}