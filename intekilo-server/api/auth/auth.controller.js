import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export async function login(req, res) {
    const { email, password } = req.body
    try {
        const user = await authService.login(email, password)
        const loginToken = authService.getLoginToken(user)


        // Fix: Remove secure: true for localhost development
        res.cookie('loginToken', loginToken, { 
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        })
        res.json({ user, loginToken })
    } catch (err) {
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function 
signup(req, res) {
    try {
        const credentials = req.body

        const account = await authService.signup(credentials)

        const user = await authService.login(credentials.email, credentials.password)

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { 
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        })
        res.json({ user, loginToken })
    } catch (err) {
        res.status(400).send({ err: err.message || 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}

export async function validateToken(req, res) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore() || {}
        if (loggedinUser) {
            res.json({ valid: true, user: loggedinUser })
        } else {
            res.status(401).json({ valid: false, message: 'Invalid or expired token' })
        }
    } catch (err) {
        res.status(401).json({ valid: false, message: 'Token validation failed' })
    }
}