import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getUsers, getUserById, updateUser, removeUser } from './user.controller.js'

const router = express.Router()

router.get('/', log, getUsers)
router.get('/:id', log, getUserById)
router.put('/:id', requireAuth, updateUser)
router.delete('/:id', requireAuth, removeUser)

export const userRoutes = router

