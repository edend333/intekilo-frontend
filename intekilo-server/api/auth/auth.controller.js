import { authService } from './auth.service.js'
import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export async function login(req, res) {
    const { email, password } = req.body
    try {
        const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)

        // Set HttpOnly cookie for security
        res.cookie('loginToken', loginToken, { 
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production', // true in production
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true // 🔒 Security: prevent XSS access
        })
        
        // Return only user data, no token in response
        res.json({ user })
    } catch (err) {
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const credentials = req.body
        const account = await authService.signup(credentials)
        const user = await authService.login(credentials.email, credentials.password)
        const loginToken = authService.getLoginToken(user)
        
        // Set HttpOnly cookie for security
        res.cookie('loginToken', loginToken, { 
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true // 🔒 Security: prevent XSS access
        })
        
        // Return only user data, no token in response
        res.json({ user })
    } catch (err) {
        res.status(400).send({ err: err.message || 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken', { 
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        })
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}

export async function validateToken(req, res) {
    try {
        const { loggedinUser } = req
        if (loggedinUser) {
            // 🔥 טעינה עדכנית מה-דטבייס במקום רק מ-JWT
            console.log('🔄 validateToken: Loading fresh data from DB for user:', loggedinUser._id)
            const updatedUser = await userService.getById(loggedinUser._id)
            console.log('📊 Fresh user data following:', updatedUser?.following)
            
            if (updatedUser) {
                // מחק password ולא שרוצים להחזיר
                delete updatedUser.password
                // המרה ObjectId ל-string אם צריך
                updatedUser._id = updatedUser._id.toString()
                
                console.log('✅ validateToken: Returning fresh user data with following count:', updatedUser.following?.length)
                res.json({ valid: true, user: updatedUser })
            } else {
                console.log('❌ validateToken: User not found in DB:', loggedinUser._id)
                res.status(401).json({ valid: false, message: 'User not found' })
            }
        } else {
            res.status(401).json({ valid: false, message: 'Invalid or expired token' })
        }
    } catch (err) {
        console.error('❌ validateToken error:', err)
        res.status(401).json({ valid: false, message: 'Token validation failed' })
    }
}

// New /me endpoint for hydration
export async function getCurrentUser(req, res) {
    try {
        const { loggedinUser } = req
        if (loggedinUser) {
            // Load fresh data from DB
            console.log('🔄 getCurrentUser: Loading fresh data from DB for user:', loggedinUser._id)
            const updatedUser = await userService.getById(loggedinUser._id)
            
            if (updatedUser) {
                delete updatedUser.password
                updatedUser._id = updatedUser._id.toString()
                console.log('✅ getCurrentUser: Returning fresh user data')
                res.json({ user: updatedUser })
            } else {
                console.log('❌ getCurrentUser: User not found in DB:', loggedinUser._id)
                res.status(401).json({ err: 'User not found' })
            }
        } else {
            res.status(401).json({ err: 'Not authenticated' })
        }
    } catch (err) {
        console.error('❌ getCurrentUser error:', err)
        res.status(401).json({ err: 'Authentication failed' })
    }
}