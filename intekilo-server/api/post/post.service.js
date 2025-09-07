import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { Post } from '../../models/post.model.js'

const PAGE_SIZE = 3

export const postService = {
    remove,
    query,
    getById,
    add,
    update,
    addPostMsg,
    removePostMsg,
}

async function query(filterBy = { txt: '' }) {
    try {
        console.log('🔍 postService.query called with:', filterBy)
        
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)
        
        console.log('📋 criteria:', criteria)
        console.log('📋 sort:', sort)

        const posts = await Post.find(criteria)
                                .sort(sort)
                                .skip(filterBy.pageIdx * PAGE_SIZE || 0)
                                .limit(PAGE_SIZE)
        
        console.log(`📊 Query returned ${posts.length} posts`)
        if (posts.length > 0) {
            console.log('📝 First post _id:', posts[0]._id)
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
        const post = await Post.findById(postId)
        
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
        const criteria = {
            _id: ObjectId.createFromHexString(postId),
        }

        if (!isAdmin) criteria['owner._id'] = ownerId

        const collection = await dbService.getCollection('post')
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
        const collection = await dbService.getCollection('post')
        await collection.insertOne(post)
        return post
    } catch (err) {
        logger.error('cannot insert post', err)
        throw err
    }
}

async function update(post) {
    const postToSave = { txt: post.txt, imgUrl: post.imgUrl }

    try {
        const criteria = { _id: ObjectId.createFromHexString(post._id) }
        const collection = await dbService.getCollection('post')
        await collection.updateOne(criteria, { $set: postToSave })

        return post
    } catch (err) {
        logger.error(`cannot update post ${post._id}`, err)
        throw err
    }
}

async function addPostMsg(postId, msg) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(postId) }
        msg.id = makeId()

        const collection = await dbService.getCollection('post')
        await collection.updateOne(criteria, { $push: { msgs: msg } })

        return msg
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}

async function removePostMsg(postId, msgId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(postId) }

        const collection = await dbService.getCollection('post')
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
            { 'by.fullname': { $regex: filterBy.txt, $options: 'i' } }
        ]
    }

    return criteria
}

function _buildSort(filterBy) {
    if (!filterBy.sortField) return { _id: -1 } // Default sort by newest first (using _id)
    return { [filterBy.sortField]: filterBy.sortDir }
}
