import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3

export const postService = {
    remove,
    query,
    getById,
    add,
    update,
    addPostMsg,
    removePostMsg,
    addPostLike,
    removePostLike,
    updateUserAvatarInPosts,
}

async function query(filterBy = { txt: '' }) {
    try {
        console.log('🔍 postService.query called with:', filterBy)
        
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)
        
        console.log('📋 criteria:', criteria)
        console.log('📋 sort:', sort)
        if (filterBy.ownerId) {
            console.log('🔍 Filtering by ownerId:', filterBy.ownerId)
        }

        const collection = await dbService.getCollection('posts')
        
        let query = collection.find(criteria).sort(sort)
        
        // If filtering by ownerId, don't limit results
        if (filterBy.ownerId) {
            // No pagination for user-specific posts
            query = query.skip(0)
        } else {
            // Apply pagination for general feed
            query = query.skip(filterBy.pageIdx * PAGE_SIZE || 0).limit(PAGE_SIZE)
        }
        
        const posts = await query.toArray()
        
        console.log(`📊 Query returned ${posts.length} posts`)
        if (posts.length > 0) {
            console.log('📝 First post _id:', posts[0]._id)
            console.log('📝 First post owner._id:', posts[0].owner?._id)
        }
        
        if (filterBy.ownerId) {
            if (posts.length === 0) {
                console.log('🔍 No posts found for ownerId:', filterBy.ownerId)
            } else {
                const ownerIds = posts.map(p => p.owner?._id)
                const allMatch = ownerIds.every(id => id === filterBy.ownerId)
                console.log('🔍 All posts match ownerId?', allMatch)
                if (!allMatch) {
                    console.log('❌ Mismatched owner IDs:', ownerIds)
                    console.log('❌ Expected ownerId:', filterBy.ownerId)
                    // Filter out posts that don't match the ownerId
                    const validPosts = posts.filter(p => p.owner?._id === filterBy.ownerId)
                    console.log(`🔍 Filtered to ${validPosts.length} valid posts`)
                    return validPosts
                }
            }
        }
    
        return posts
    } catch (err) {
        console.error('❌ Error in postService.query:', err)
        logger.error('cannot find posts', err)
        throw err
    }
}

async function getById(postId) {
    try {
        const collection = await dbService.getCollection('posts')
        // Handle both string IDs and ObjectId
        const criteria = postId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(postId) }
            : { _id: postId }
        
        const post = await collection.findOne(criteria)
        
        if (!post) {
            logger.error(`Post not found: ${postId}`)
            throw new Error('Post not found')
        }

        return post
    } catch (err) {
        logger.error(`while finding post ${postId}`, err)
        throw err
    }
}

async function remove(postId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

    try {
        // Handle both string IDs and ObjectId
        const criteria = postId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(postId) }
            : { _id: postId }

        if (!isAdmin) criteria['owner._id'] = ownerId

        const collection = await dbService.getCollection('posts')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw ('Not your post')
        return postId
    } catch (err) {
        logger.error(`cannot remove post ${postId}`, err)
        throw err
    }
}

async function add(post) {
    try {
        const collection = await dbService.getCollection('posts')
        const result = await collection.insertOne(post)
        
        // Return the post with the MongoDB-generated ObjectId
        return { ...post, _id: result.insertedId }
    } catch (err) {
        logger.error('cannot insert post', err)
        throw err
    }
}

async function update(post) {
    const postToSave = { 
        txt: post.txt, 
        imgUrl: post.imgUrl,
        videoUrl: post.videoUrl,
        posterUrl: post.posterUrl,
        duration: post.duration,
        width: post.width,
        height: post.height,
        format: post.format,
        type: post.type
    }

    try {
        // Handle both string IDs and ObjectId
        const criteria = post._id.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(post._id) }
            : { _id: post._id }
        const collection = await dbService.getCollection('posts')
        await collection.updateOne(criteria, { $set: postToSave })

        return post
    } catch (err) {
        logger.error(`cannot update post ${post._id}`, err)
        throw err
    }
}

async function addPostMsg(postId, msg) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = postId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(postId) }
            : { _id: postId }
        // Don't set id - let MongoDB handle it or use ObjectId
        // msg.id = makeId() // Removed - using ObjectId instead

        const collection = await dbService.getCollection('posts')
        await collection.updateOne(criteria, { $push: { msgs: msg } })

        return msg
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}

async function removePostMsg(postId, msgId) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = postId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(postId) }
            : { _id: postId }

        const collection = await dbService.getCollection('posts')
        await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })

        return msgId
    } catch (err) {
        logger.error(`cannot remove post msg ${postId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    
    if (filterBy.txt) {
        criteria.$or = [
            { txt: { $regex: filterBy.txt, $options: 'i' } },
            { 'owner.fullname': { $regex: filterBy.txt, $options: 'i' } }
        ]
    }

    if (filterBy.ownerId) {
        // Ensure ownerId is not empty and is a valid string
        if (filterBy.ownerId.trim() === '') {
            console.error('❌ Empty ownerId provided to _buildCriteria')
            throw new Error('Invalid ownerId: cannot be empty')
        }
        
        // Handle both ObjectId and string formats
        if (filterBy.ownerId.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a valid ObjectId string, use it as-is for comparison
            criteria['owner._id'] = filterBy.ownerId
        } else {
            // It's a custom string ID, use it as-is
            criteria['owner._id'] = filterBy.ownerId
        }
        
        console.log('🔍 Added ownerId filter:', filterBy.ownerId)
        console.log('🔍 Filter type:', typeof filterBy.ownerId)
    }

    console.log('🔍 Final criteria:', JSON.stringify(criteria, null, 2))
    return criteria
}

function _buildSort(filterBy) {
    if (!filterBy.sortField) return { _id: -1 } // Default sort by newest first (using _id)
    return { [filterBy.sortField]: filterBy.sortDir }
}

async function addPostLike(postId, like) {
    try {
        console.log('❤️ Adding like to post:', postId, 'by user:', like._id)
        
        // Handle both string IDs and ObjectId - same logic as user.service.js
        const criteria = postId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(postId) }
            : { _id: postId }
        
        const collection = await dbService.getCollection('posts')
        await collection.updateOne(criteria, { $push: { likedBy: like } })
        
        console.log('✅ Like added successfully')
        return like
    } catch (err) {
        logger.error(`cannot add post like ${postId}`, err)
        throw err
    }
}

async function removePostLike(postId, userId) {
    try {
        console.log('💔 Removing like from post:', postId, 'by user:', userId)
        
        // Handle both string IDs and ObjectId - same logic as user.service.js
        const criteria = postId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(postId) }
            : { _id: postId }
        
        const collection = await dbService.getCollection('posts')
        await collection.updateOne(criteria, { $pull: { likedBy: { _id: userId } } })
        
        console.log('✅ Like removed successfully')
        return userId
    } catch (err) {
        logger.error(`cannot remove post like ${postId}`, err)
        throw err
    }
}

async function updateUserAvatarInPosts(userId, newImgUrl) {
    try {
        console.log('🔄 Updating user avatar in all posts:', userId, newImgUrl)
        
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }
        
        const collection = await dbService.getCollection('posts')
        
        // Update all posts where this user is the owner
        const result = await collection.updateMany(
            { 'owner._id': userId },
            { 
                $set: { 
                    'owner.imgUrl': newImgUrl,
                    updatedAt: new Date()
                } 
            }
        )

        // Also update user avatar in likes array
        const likesResult = await collection.updateMany(
            { 'likedBy._id': userId },
            { 
                $set: { 
                    'likedBy.$.imgUrl': newImgUrl,
                    updatedAt: new Date()
                } 
            }
        )
        
        console.log(`✅ Updated ${result.modifiedCount} posts (owner) and ${likesResult.modifiedCount} posts (likes) with new avatar for user ${userId}`)
        return result.modifiedCount + likesResult.modifiedCount
    } catch (err) {
        logger.error(`cannot update user avatar in posts for user ${userId}`, err)
        throw err
    }
}
