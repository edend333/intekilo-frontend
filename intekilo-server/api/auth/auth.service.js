import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
	signup,
	login,
	getLoginToken,
	validateToken,
}

async function login(email, password) {
	const user = await userService.getByEmail(email)
	if (!user) return Promise.reject('Invalid email or password')

	// Check password using bcrypt.compare for hashed passwords
	const isPasswordValid = await bcrypt.compare(password, user.password)
	if (!isPasswordValid) {
		return Promise.reject('Invalid email or password')
	}

	delete user.password
	user._id = user._id.toString()
	return user
}

async function signup({ email, username, password, fullname, imgUrl }) {
	const saltRounds = 10

	if (!email || !username || !password || !fullname) {
		return Promise.reject('Missing required signup information')
	}

	// Check if email already exists
	const emailExist = await userService.getByEmail(email)
	if (emailExist) {
		return Promise.reject('Email already taken')
	}

	// Check if username already exists
	const usernameExist = await userService.getByUsername(username)
	if (usernameExist) {
		return Promise.reject('Username already taken')
	}

	const hash = await bcrypt.hash(password, saltRounds)
	const newUser = { 
		email, 
		username, 
		password: hash, 
		fullname, 
		imgUrl, 
		bio: '',
		ROUL: 'user',
		following: [],
		followers: [],
		likedStoryIds: [],
		savedStoryIds: []
	}
	
	const result = await userService.add(newUser)
	return result
}

function getLoginToken(user) {
    const userInfo = { 
        _id: user._id, 
        fullname: user.fullname, 
        imgUrl: user.imgUrl,
        username: user.username,
        isAdmin: user.ROUL === 'admin',
        exp: Date.now() + (24 * 60 * 60 * 1000) // Add expiration: 24 hours from now
        // exp: Date.now() + (1 * 60 * 1000 ) // Add expiration: 24 hours from now
    }
    return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        
        // Check if token is expired
        if (loggedinUser.exp && Date.now() > loggedinUser.exp) {
            return null // Token expired
        }
        
        return loggedinUser
    } catch (err) {
        // Invalid login token
    }
    return null
}