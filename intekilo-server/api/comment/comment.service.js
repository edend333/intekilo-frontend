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
        const comment = await collection.findOne({ _id: ObjectId.createFromHexString(commentId) })
        
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
        const criteria = {
            _id: ObjectId.createFromHexString(commentId),
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
        comment._id = makeId()
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
        const criteria = { _id: ObjectId.createFromHexString(comment._id) }
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
        const criteria = { _id: ObjectId.createFromHexString(commentId) }
        
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
        const criteria = { _id: ObjectId.createFromHexString(commentId) }

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
        criteria.postId = filterBy.postId
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
