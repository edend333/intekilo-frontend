import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getComments, getCommentById, addComment, updateComment, removeComment, addCommentLike, removeCommentLike, migrateOldComments } from './comment.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getComments)
router.get('/:id', log, getCommentById)
router.post('/', log, requireAuth, addComment)
router.put('/:id', requireAuth, updateComment)
router.delete('/:id', requireAuth, removeComment)

router.post('/:id/like', requireAuth, addCommentLike)
router.delete('/:id/like', requireAuth, removeCommentLike)

// Migration endpoint (admin only)
router.post('/migrate', requireAuth, migrateOldComments)

export const commentRoutes = router
