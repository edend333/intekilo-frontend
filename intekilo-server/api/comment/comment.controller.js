import { logger } from '../../services/logger.service.js'
import { commentService } from './comment.service.js'

export async function getComments(req, res) {
    try {
        console.log('🔍 getComments called')
        const filterBy = {
            txt: req.query.txt || '',
            postId: req.query.postId || '',
            sortField: req.query.sortField || '',
            sortDir: req.query.sortDir || 1,
            pageIdx: req.query.pageIdx,
        }
        console.log('📋 filterBy:', filterBy)
        
        const comments = await commentService.query(filterBy)
        console.log(`📊 Found ${comments.length} comments`)
        
        res.json(comments)
    } catch (err) {
        console.error('❌ Error in getComments:', err)
        logger.error('Failed to get comments', err)
        res.status(400).send({ err: 'Failed to get comments' })
    }
}

export async function getCommentById(req, res) {
    try {
        const commentId = req.params.id
        const comment = await commentService.getById(commentId)
        res.json(comment)
    } catch (err) {
        logger.error('Failed to get comment', err)
        res.status(400).send({ err: 'Failed to get comment' })
    }
}

export async function addComment(req, res) {
    const { loggedinUser, body: comment } = req

    try {
        comment.by = loggedinUser
        const addedComment = await commentService.add(comment)
        res.json(addedComment)
    } catch (err) {
        logger.error('Failed to add comment', err)
        res.status(400).send({ err: 'Failed to add comment' })
    }
}

export async function updateComment(req, res) {
    const { loggedinUser, body: comment } = req
    const { _id: userId, isAdmin } = loggedinUser

    if (!isAdmin && comment.by._id !== userId) {
        res.status(403).send('Not your comment...')
        return
    }

    try {
        const updatedComment = await commentService.update(comment)
        res.json(updatedComment)
    } catch (err) {
        logger.error('Failed to update comment', err)
        res.status(400).send({ err: 'Failed to update comment' })
    }
}

export async function removeComment(req, res) {
    try {
        const commentId = req.params.id
        const removedId = await commentService.remove(commentId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove comment', err)
        res.status(400).send({ err: 'Failed to remove comment' })
    }
}

export async function addCommentLike(req, res) {
    const { loggedinUser } = req

    try {
        const commentId = req.params.id
        const like = {
            by: loggedinUser,
        }
        const savedLike = await commentService.addCommentLike(commentId, like)
        res.send(savedLike)
    } catch (err) {
        logger.error('Failed to add comment like', err)
        res.status(400).send({ err: 'Failed to add comment like' })
    }
}

export async function removeCommentLike(req, res) {
    try {
        const commentId = req.params.id
        const removedId = await commentService.removeCommentLike(commentId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove comment like', err)
        res.status(400).send({ err: 'Failed to remove comment like' })
    }
}
