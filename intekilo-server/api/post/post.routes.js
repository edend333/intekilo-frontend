import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getPosts, getPostById, addPost, updatePost, removePost, addPostMsg, removePostMsg } from './post.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getPosts)
router.get('/:id', log, getPostById)
router.post('/', log, requireAuth, addPost)
router.put('/:id', requireAuth, updatePost)
router.delete('/:id', requireAuth, removePost)
// router.delete('/:id', requireAuth, requireAdmin, removePost)

router.post('/:id/msg', requireAuth, addPostMsg)
// router.delete('/:id/msg/:msgId', requireAuth, removePostMsg)

export const postRoutes = router
