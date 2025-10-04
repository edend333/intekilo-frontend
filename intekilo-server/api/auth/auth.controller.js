import { authService } from './auth.service.js'
import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export async function login(req, res) {
    const { email, password } = req.body
    try {
        const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)


        res.cookie('loginToken', loginToken, { 
            sameSite: 'Lax',
            secure: false, // Keep false for localhost development
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            httpOnly: false // Allow client-side access
        })
        res.json({ user, loginToken })
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
        res.cookie('loginToken', loginToken, { 
            sameSite: 'Lax',
            secure: false, // Keep false for localhost development
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            httpOnly: false // Allow client-side access
        })
        res.json({ user, loginToken })
    } catch (err) {
        res.status(400).send({ err: err.message || 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken', { 
            sameSite: 'Lax',
            secure: false, // Keep false for localhost development
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