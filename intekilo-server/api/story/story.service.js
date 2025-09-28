import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'

export const storyService = {
  query,
  getById,
  add,
  update,
  remove,
  addViewer,
  addLike,
  removeLike,
  getActiveStories,
  getStoriesByUser
}

async function query(filterBy = {}) {
  try {
    console.log('🔍 Fetching stories with filter:', filterBy)
    const collection = await dbService.getCollection('stories')
    
    // Build criteria
    const criteria = {}
    
    // Only show active stories (not expired)
    criteria.expiresAt = { $gt: Date.now() }
    
    // Filter by allowed users (following logic)
    if (filterBy.allowedUserIds && filterBy.allowedUserIds.length > 0) {
      criteria.byUserId = { $in: filterBy.allowedUserIds }
      console.log('👥 Filtering by allowed users:', filterBy.allowedUserIds)
    }
    
    // Filter by specific user if specified (overrides allowedUserIds)
    if (filterBy.byUserId) {
      criteria.byUserId = filterBy.byUserId
      console.log('👤 Filtering by specific user:', filterBy.byUserId)
    }
    
    // Filter by type if specified
    if (filterBy.type) {
      criteria.type = filterBy.type
    }
    
    // Sort by creation date (newest first)
    const stories = await collection.find(criteria).sort({ createdAt: -1 }).toArray()
    
    console.log(`📊 Found ${stories.length} active stories`)
    return stories
  } catch (err) {
    logger.error('Cannot get stories', err)
    throw err
  }
}

async function getById(storyId) {
  try {
    console.log('🔍 Fetching story:', storyId)
    const collection = await dbService.getCollection('stories')
    const story = await collection.findOne({ _id: storyId })
    
    if (!story) {
      throw new Error('Story not found')
    }
    
    // Check if story is still active
    if (story.expiresAt < Date.now()) {
      throw new Error('Story has expired')
    }
    
    return story
  } catch (err) {
    logger.error(`Cannot get story ${storyId}`, err)
    throw err
  }
}

async function add(story) {
  try {
    console.log('➕ Adding story:', story._id)
    const collection = await dbService.getCollection('stories')
    
    // Set expiration time (24 hours from now)
    story.expiresAt = Date.now() + (24 * 60 * 60 * 1000)
    story.createdAt = Date.now()
    
    await collection.insertOne(story)
    console.log('✅ Story added successfully')
    return story
  } catch (err) {
    logger.error('Cannot add story', err)
    throw err
  }
}

async function update(story) {
  try {
    console.log('✏️ Updating story:', story._id)
    const collection = await dbService.getCollection('stories')
    
    const storyToSave = { ...story }
    delete storyToSave._id
    
    await collection.updateOne({ _id: story._id }, { $set: storyToSave })
    console.log('✅ Story updated successfully')
    return story
  } catch (err) {
    logger.error('Cannot update story', err)
    throw err
  }
}

async function remove(storyId) {
  try {
    console.log('🗑️ Removing story:', storyId)
    const collection = await dbService.getCollection('stories')
    await collection.deleteOne({ _id: storyId })
    console.log('✅ Story removed successfully')
    return storyId
  } catch (err) {
    logger.error('Cannot remove story', err)
    throw err
  }
}

async function addViewer(storyId, viewerId) {
  try {
    console.log('👁️ Adding viewer to story:', storyId, 'viewer:', viewerId)
    const collection = await dbService.getCollection('stories')
    
    const story = await collection.findOne({ _id: storyId })
    if (!story) {
      throw new Error('Story not found')
    }
    
    // Check if already viewed
    if (story.viewersPreview?.includes(viewerId)) {
      console.log('⚠️ User already viewed this story')
      return story
    }
    
    // Add viewer to preview (max 3 viewers)
    const viewersPreview = story.viewersPreview || []
    if (viewersPreview.length < 3) {
      viewersPreview.push(viewerId)
    }
    
    await collection.updateOne(
      { _id: storyId },
      { 
        $set: { 
          viewersPreview,
          viewersCount: story.viewersCount + 1
        }
      }
    )
    
    console.log('✅ Viewer added successfully')
    return { ...story, viewersPreview, viewersCount: story.viewersCount + 1 }
  } catch (err) {
    logger.error('Cannot add viewer to story', err)
    throw err
  }
}

async function addLike(storyId, userId) {
  try {
    console.log('❤️ Adding like to story:', storyId, 'by user:', userId)
    const collection = await dbService.getCollection('stories')
    
    const story = await collection.findOne({ _id: storyId })
    if (!story) {
      throw new Error('Story not found')
    }
    
    await collection.updateOne(
      { _id: storyId },
      { $inc: { likesCount: 1 } }
    )
    
    console.log('✅ Like added successfully')
    return { ...story, likesCount: story.likesCount + 1 }
  } catch (err) {
    logger.error('Cannot add like to story', err)
    throw err
  }
}

async function removeLike(storyId, userId) {
  try {
    console.log('💔 Removing like from story:', storyId, 'by user:', userId)
    const collection = await dbService.getCollection('stories')
    
    const story = await collection.findOne({ _id: storyId })
    if (!story) {
      throw new Error('Story not found')
    }
    
    if (story.likesCount > 0) {
      await collection.updateOne(
        { _id: storyId },
        { $inc: { likesCount: -1 } }
      )
    }
    
    console.log('✅ Like removed successfully')
    return { ...story, likesCount: Math.max(0, story.likesCount - 1) }
  } catch (err) {
    logger.error('Cannot remove like from story', err)
    throw err
  }
}

async function getActiveStories() {
  try {
    console.log('🔍 Fetching active stories')
    const collection = await dbService.getCollection('stories')
    
    const stories = await collection
      .find({ expiresAt: { $gt: Date.now() } })
      .sort({ createdAt: -1 })
      .toArray()
    
    console.log(`📊 Found ${stories.length} active stories`)
    return stories
  } catch (err) {
    logger.error('Cannot get active stories', err)
    throw err
  }
}

async function getStoriesByUser(userId) {
  try {
    console.log('🔍 Fetching stories by user:', userId)
    const collection = await dbService.getCollection('stories')
    
    const stories = await collection
      .find({ 
        byUserId: userId,
        expiresAt: { $gt: Date.now() }
      })
      .sort({ createdAt: -1 })
      .toArray()
    
    console.log(`📊 Found ${stories.length} stories by user ${userId}`)
    return stories
  } catch (err) {
    logger.error('Cannot get stories by user', err)
    throw err
  }
}