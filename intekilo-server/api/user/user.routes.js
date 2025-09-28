import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { 
    getUsers, 
    getUserById, 
    updateUser, 
    updateBio, 
    updateAvatar,
    addSavedPost,
    removeSavedPost,
    getSavedPosts,
    removeUser,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    removeFollower,
    getProfileWithCounts
} from './user.controller.js'

const router = express.Router()

// Public routes
router.get('/', log, getUsers)

// Specific routes must come before generic :id routes
router.get('/:userId/followers', log, getFollowers)
router.get('/:userId/following', log, getFollowing)
router.get('/:userId/is-following', requireAuth, isFollowing)
router.get('/:id/profile', log, getProfileWithCounts)

// Generic routes (must come after specific routes)
router.get('/:id', log, getUserById)

// Protected routes (auth required)
router.put('/:id/bio', requireAuth, updateBio)
router.patch('/me/avatar', requireAuth, updateAvatar)
router.get('/me/saved-posts', requireAuth, getSavedPosts)
router.put('/me/saved-posts/:postId', requireAuth, addSavedPost)
router.delete('/me/saved-posts/:postId', requireAuth, removeSavedPost)
router.put('/:id', requireAuth, updateUser)
router.delete('/:id', requireAuth, removeUser)

// Follow/Unfollow routes
router.post('/:userId/follow', requireAuth, followUser)
router.delete('/:userId/follow', requireAuth, unfollowUser)
router.delete('/:userId/follower', requireAuth, removeFollower)

export const userRoutes = router