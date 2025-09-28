import { logger } from '../../services/logger.service.js'
import { storyService } from './story.service.js'

export async function getStories(req, res) {
  try {
    console.log('🔍 getStories called')
    const { loggedinUser } = req
    
    // Get user's following list
    const followingIds = loggedinUser?.following || []
    const userId = loggedinUser?._id
    
    // Include user's own stories + stories from users they follow
    const allowedUserIds = [userId, ...followingIds]
    
    const filterBy = {
      byUserId: req.query.byUserId || '',
      type: req.query.type || '',
      allowedUserIds: allowedUserIds // New filter for following logic
    }
    console.log('📋 filterBy:', filterBy)
    console.log('👥 Allowed users:', allowedUserIds)
    
    const stories = await storyService.query(filterBy)
    console.log(`📊 Found ${stories.length} stories`)
    
    res.json(stories)
  } catch (err) {
    console.error('❌ Error in getStories:', err)
    logger.error('Failed to get stories', err)
    res.status(400).send({ err: 'Failed to get stories' })
  }
}

export async function getStoryById(req, res) {
  try {
    const storyId = req.params.id
    const story = await storyService.getById(storyId)
    res.json(story)
  } catch (err) {
    logger.error('Failed to get story', err)
    res.status(400).send({ err: 'Failed to get story' })
  }
}

export async function addStory(req, res) {
  const { loggedinUser, body: story } = req

  try {
    story.byUserId = loggedinUser._id
    const addedStory = await storyService.add(story)
    res.json(addedStory)
  } catch (err) {
    logger.error('Failed to add story', err)
    res.status(400).send({ err: 'Failed to add story' })
  }
}

export async function updateStory(req, res) {
  const { loggedinUser, body: story } = req
  const { _id: userId, isAdmin } = loggedinUser

  if (!isAdmin && story.byUserId !== userId) {
    res.status(403).send('Not your story...')
    return
  }

  try {
    const updatedStory = await storyService.update(story)
    res.json(updatedStory)
  } catch (err) {
    logger.error('Failed to update story', err)
    res.status(400).send({ err: 'Failed to update story' })
  }
}

export async function removeStory(req, res) {
  try {
    const storyId = req.params.id
    const removedId = await storyService.remove(storyId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove story', err)
    res.status(400).send({ err: 'Failed to remove story' })
  }
}

export async function addStoryViewer(req, res) {
  const { loggedinUser } = req

  try {
    const storyId = req.params.id
    const viewerId = loggedinUser._id
    const updatedStory = await storyService.addViewer(storyId, viewerId)
    res.json(updatedStory)
  } catch (err) {
    logger.error('Failed to add story viewer', err)
    res.status(400).send({ err: 'Failed to add story viewer' })
  }
}

export async function addStoryLike(req, res) {
  const { loggedinUser } = req

  try {
    console.log('❤️ addStoryLike called by user:', loggedinUser._id)
    const storyId = req.params.id
    const userId = loggedinUser._id
    const updatedStory = await storyService.addLike(storyId, userId)
    res.json(updatedStory)
  } catch (err) {
    logger.error('Failed to add story like', err)
    res.status(400).send({ err: 'Failed to add story like' })
  }
}

export async function removeStoryLike(req, res) {
  const { loggedinUser } = req

  try {
    console.log('💔 removeStoryLike called by user:', loggedinUser._id)
    const storyId = req.params.id
    const userId = loggedinUser._id
    const updatedStory = await storyService.removeLike(storyId, userId)
    res.json(updatedStory)
  } catch (err) {
    logger.error('Failed to remove story like', err)
    res.status(400).send({ err: 'Failed to remove story like' })
  }
}

export async function getActiveStories(req, res) {
  try {
    console.log('🔍 getActiveStories called')
    const stories = await storyService.getActiveStories()
    console.log(`📊 Found ${stories.length} active stories`)
    res.json(stories)
  } catch (err) {
    console.error('❌ Error in getActiveStories:', err)
    logger.error('Failed to get active stories', err)
    res.status(400).send({ err: 'Failed to get active stories' })
  }
}

export async function getStoriesByUser(req, res) {
  try {
    const userId = req.params.userId
    console.log('🔍 getStoriesByUser called for user:', userId)
    const stories = await storyService.getStoriesByUser(userId)
    console.log(`📊 Found ${stories.length} stories by user ${userId}`)
    res.json(stories)
  } catch (err) {
    console.error('❌ Error in getStoriesByUser:', err)
    logger.error('Failed to get stories by user', err)
    res.status(400).send({ err: 'Failed to get stories by user' })
  }
}