import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { 
  getStories, 
  getStoryById, 
  addStory, 
  updateStory, 
  removeStory, 
  addStoryViewer, 
  addStoryLike, 
  removeStoryLike,
  getActiveStories,
  getStoriesByUser
} from './story.controller.js'

const router = express.Router()

// Public routes (no auth required)
router.get('/active', log, getActiveStories)
router.get('/user/:userId', log, getStoriesByUser)
router.get('/:id', log, getStoryById)

// Protected routes (auth required) - including getStories for following logic
router.get('/', log, requireAuth, getStories)
router.post('/', log, requireAuth, addStory)
router.put('/:id', requireAuth, updateStory)
router.delete('/:id', requireAuth, removeStory)

// Story interactions
router.post('/:id/view', requireAuth, addStoryViewer)
router.post('/:id/like', requireAuth, addStoryLike)
router.delete('/:id/like', requireAuth, removeStoryLike)

export const storyRoutes = router