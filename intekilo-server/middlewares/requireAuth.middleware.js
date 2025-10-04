import config from '../config/index.js'
import { logger } from '../services/logger.service.js'
import { asyncLocalStorage } from '../services/als.service.js'

export function requireAuth(req, res, next) {
	console.log('🔐 requireAuth middleware called for:', req.method, req.url)
	
	const { loggedinUser } = asyncLocalStorage.getStore()
	console.log('🔍 requireAuth - loggedinUser:', loggedinUser ? loggedinUser._id : 'NOT FOUND')
	
	if (loggedinUser) {
		console.log('👤 Authenticated user details:', {
			_id: loggedinUser._id,
			username: loggedinUser.username,
			fullname: loggedinUser.fullname,
			email: loggedinUser.email,
			isAdmin: loggedinUser.isAdmin
		})
	}
	
	req.loggedinUser = loggedinUser

	if (!loggedinUser) {
		console.log('❌ requireAuth - No loggedinUser found, returning 401')
		return res.status(401).json({ err: 'auth-required' })
	}
	console.log('✅ requireAuth - User authenticated:', loggedinUser._id)
	next()
}

export function requireAdmin(req, res, next) {
	const { loggedinUser } = asyncLocalStorage.getStore()
    
	if (!loggedinUser) return res.status(401).json({ err: 'auth-required' })
	if (!loggedinUser.isAdmin) {
		logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
		res.status(403).json({ err: 'admin-required' })
		return
	}
	next()
}
