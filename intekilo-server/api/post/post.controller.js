import { logger } from '../../services/logger.service.js'
import { postService } from './post.service.js'

export async function getPosts(req, res) {
    try {
        console.log('🔍 getPosts called')
        const filterBy = {
            txt: req.query.txt || '',
            sortField: req.query.sortField || '',
            sortDir: req.query.sortDir || 1,
            pageIdx: req.query.pageIdx,
        }
        console.log('📋 filterBy:', filterBy)
        
        const posts = await postService.query(filterBy)
        console.log(`📊 Found ${posts.length} posts`)
        
        res.json(posts)
    } catch (err) {
        console.error('❌ Error in getPosts:', err)
        logger.error('Failed to get posts', err)
        res.status(400).send({ err: 'Failed to get posts' })
    }
}

export async function getPostById(req, res) {
    try {
        const postId = req.params.id
        const post = await postService.getById(postId)
        res.json(post)
    } catch (err) {
        logger.error('Failed to get post', err)
        res.status(400).send({ err: 'Failed to get post' })
    }
}

export async function addPost(req, res) {
    const { loggedinUser, body: post } = req

    try {
        post.owner = loggedinUser
        const addedPost = await postService.add(post)
        res.json(addedPost)
    } catch (err) {
        logger.error('Failed to add post', err)
        res.status(400).send({ err: 'Failed to add post' })
    }
}

export async function updatePost(req, res) {
    const { loggedinUser, body: post } = req
    const { _id: userId, isAdmin } = loggedinUser

    if (!isAdmin && post.owner._id !== userId) {
        res.status(403).send('Not your post...')
        return
    }

    try {
        const updatedPost = await postService.update(post)
        res.json(updatedPost)
    } catch (err) {
        logger.error('Failed to update post', err)
        res.status(400).send({ err: 'Failed to update post' })
    }
}

export async function removePost(req, res) {
    try {
        const postId = req.params.id
        const removedId = await postService.remove(postId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove post', err)
        res.status(400).send({ err: 'Failed to remove post' })
    }
}

export async function addPostMsg(req, res) {
    const { loggedinUser } = req

    try {
        const postId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
        }
        const savedMsg = await postService.addPostMsg(postId, msg)
        res.send(savedMsg)
    } catch (err) {
        logger.error('Failed to add post msg', err)
        res.status(400).send({ err: 'Failed to add post msg' })
    }
}

export async function removePostMsg(req, res) {
    try {
        const { id: postId, msgId } = req.params

        const removedId = await postService.removePostMsg(postId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove post msg', err)
        res.status(400).send({ err: 'Failed to remove post msg' })
    }
}
