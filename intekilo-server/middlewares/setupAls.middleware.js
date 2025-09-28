import { authService } from '../api/auth/auth.service.js'
import { asyncLocalStorage } from '../services/als.service.js'

export async function setupAsyncLocalStorage(req, res, next) {
	const storage = {}
	asyncLocalStorage.run(storage, () => {
		console.log('🔍 setupAls - Request URL:', req.url)
		console.log('🔍 setupAls - Request method:', req.method)
		console.log('🔍 setupAls - Cookies:', req.cookies)
		
		if (!req.cookies?.loginToken) {
			console.log('❌ No loginToken cookie found')
			return next()
		}
		
		console.log('🔍 Found loginToken cookie, validating...')
		try {
			const loggedinUser = authService.validateToken(req.cookies.loginToken)

			if (loggedinUser) {
				console.log('✅ Valid token, setting loggedinUser:', loggedinUser._id)
				console.log('👤 User details:', {
					_id: loggedinUser._id,
					username: loggedinUser.username,
					fullname: loggedinUser.fullname,
					email: loggedinUser.email
				})
				const alsStore = asyncLocalStorage.getStore()
				alsStore.loggedinUser = loggedinUser
			} else {
				console.log('❌ Invalid token')
			}
		} catch (error) {
			console.error('❌ Error validating token:', error)
		}
		next()
	})
}
