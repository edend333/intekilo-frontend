import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 10

export const commentService = {
    remove,
    query,
    getById,
    add,
    update,
    addCommentLike,
    removeCommentLike,
    updateUserAvatarInComments,
    migrateOldComments,
}

async function query(filterBy = { txt: '', postId: '' }) {
    try {
        console.log('🔍 commentService.query called with:', filterBy)
        
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)
        
        console.log('📋 criteria:', criteria)
        console.log('📋 sort:', sort)

        const collection = await dbService.getCollection('comments')
        const comments = await collection.find(criteria)
                                .sort(sort)
                                .skip(filterBy.pageIdx * PAGE_SIZE || 0)
                                .limit(PAGE_SIZE)
                                .toArray()
        
        console.log(`📊 Query returned ${comments.length} comments`)
        if (comments.length > 0) {
            console.log('�� First comment _id:', comments[0]._id)
        }
    
        return comments
    } catch (err) {
        console.error('❌ Error in commentService.query:', err)
        logger.error('cannot find comments', err)
        throw err
    }
}

async function getById(commentId) {
    try {
        const collection = await dbService.getCollection('comments')
        // Handle both string IDs and ObjectId
        const criteria = commentId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(commentId) }
            : { _id: commentId }
        
        const comment = await collection.findOne(criteria)
        
        if (!comment) {
            logger.error(`Comment not found: ${commentId}`)
            throw new Error('Comment not found')
        }

        return comment
    } catch (err) {
        logger.error(`while finding comment ${commentId}`, err)
        throw err
    }
}

async function remove(commentId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

    try {
        // Handle both string IDs and ObjectId
        const criteria = {
            _id: commentId.match(/^[0-9a-fA-F]{24}$/) 
                ? new ObjectId(commentId)
                : commentId
        }

        if (!isAdmin) criteria['by._id'] = ownerId

        const collection = await dbService.getCollection('comments')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw ('Not your comment')
        return commentId
    } catch (err) {
        logger.error(`cannot remove comment ${commentId}`, err)
        throw err
    }
}

async function add(comment) {
    try {
        // Don't set _id - let MongoDB create ObjectId automatically
        comment.createdAt = new Date()
        comment.likedBy = []
        
        const collection = await dbService.getCollection('comments')
        await collection.insertOne(comment)
        return comment
    } catch (err) {
        logger.error('cannot insert comment', err)
        throw err
    }
}

async function update(comment) {
    const commentToSave = { txt: comment.txt }

    try {
        // Handle both string IDs and ObjectId
        const criteria = { 
            _id: comment._id.match(/^[0-9a-fA-F]{24}$/) 
                ? new ObjectId(comment._id)
                : comment._id
        }
        const collection = await dbService.getCollection('comments')
        await collection.updateOne(criteria, { $set: commentToSave })

        return comment
    } catch (err) {
        logger.error(`cannot update comment ${comment._id}`, err)
        throw err
    }
}

async function addCommentLike(commentId, like) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = { 
            _id: commentId.match(/^[0-9a-fA-F]{24}$/) 
                ? new ObjectId(commentId)
                : commentId
        }
        
        const collection = await dbService.getCollection('comments')
        await collection.updateOne(criteria, { $push: { likedBy: like.by } })

        return like.by
    } catch (err) {
        logger.error(`cannot add comment like ${commentId}`, err)
        throw err
    }
}

async function removeCommentLike(commentId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: userId } = loggedinUser

    try {
        // Handle both string IDs and ObjectId
        const criteria = { 
            _id: commentId.match(/^[0-9a-fA-F]{24}$/) 
                ? new ObjectId(commentId)
                : commentId
        }

        const collection = await dbService.getCollection('comments')
        await collection.updateOne(criteria, { $pull: { likedBy: { _id: userId } } })

        return commentId
    } catch (err) {
        logger.error(`cannot remove comment like ${commentId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    
    if (filterBy.postId) {
        // Handle both ObjectId and string formats for postId
        if (filterBy.postId.match(/^[0-9a-fA-F]{24}$/)) {
            criteria.postId = filterBy.postId
        } else {
            criteria.postId = filterBy.postId
        }
    }
    
    if (filterBy.txt) {
        criteria.$or = [
            { txt: { $regex: filterBy.txt, $options: 'i' } },
            { 'by.fullname': { $regex: filterBy.txt, $options: 'i' } }
        ]
    }

    return criteria
}

function _buildSort(filterBy) {
    if (!filterBy.sortField) return { createdAt: -1 } // Default sort by newest first
    return { [filterBy.sortField]: filterBy.sortDir }
}

async function updateUserAvatarInComments(userId, newImgUrl) {
    try {
        console.log('🔄 Updating user avatar in all comments:', userId, newImgUrl)
        
        const collection = await dbService.getCollection('comments')
        
        // Update all comments where this user is the author
        const result = await collection.updateMany(
            { 'by._id': userId },
            { 
                $set: { 
                    'by.imgUrl': newImgUrl,
                    updatedAt: new Date()
                } 
            }
        )
        
        console.log(`✅ Updated ${result.modifiedCount} comments with new avatar for user ${userId}`)
        return result.modifiedCount
    } catch (err) {
        logger.error(`cannot update user avatar in comments for user ${userId}`, err)
        throw err
    }
}

async function migrateOldComments() {
    try {
        console.log('🔄 Migrating old comments to include user data...')
        
        const collection = await dbService.getCollection('comments')
        const userCollection = await dbService.getCollection('users')
        
        // Find comments where 'by' is just an ID (string)
        const oldComments = await collection.find({
            'by': { $type: 'string' }
        }).toArray()
        
        console.log(`📊 Found ${oldComments.length} old comments to migrate`)
        
        let migratedCount = 0
        
        for (const comment of oldComments) {
            try {
                // Get user data
                const user = await userCollection.findOne({ _id: comment.by })
                
                if (user) {
                    // Update comment with full user object
                    await collection.updateOne(
                        { _id: comment._id },
                        { 
                            $set: { 
                                'by': {
                                    _id: user._id,
                                    username: user.username,
                                    fullname: user.fullname,
                                    imgUrl: user.imgUrl
                                },
                                migratedAt: new Date()
                            } 
                        }
                    )
                    migratedCount++
                } else {
                    console.log(`⚠️ User not found for comment ${comment._id}: ${comment.by}`)
                }
            } catch (err) {
                console.error(`❌ Error migrating comment ${comment._id}:`, err)
            }
        }
        
        console.log(`✅ Migrated ${migratedCount} comments successfully`)
        return migratedCount
    } catch (err) {
        logger.error('cannot migrate old comments', err)
        throw err
    }
}
