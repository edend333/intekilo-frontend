import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { login, signup, logout, validateToken, getCurrentUser } from './auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/validate', requireAuth, validateToken)
router.get('/me', requireAuth, getCurrentUser) // New endpoint for hydration

export const authRoutes = router