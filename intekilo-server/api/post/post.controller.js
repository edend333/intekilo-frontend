import { logger } from '../../services/logger.service.js'
import { postService } from './post.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export async function getPosts(req, res) {
    try {
        console.log('🔍 getPosts called')
        const filterBy = {
            txt: req.query.txt || '',
            sortField: req.query.sortField || '',
            sortDir: req.query.sortDir || 1,
            pageIdx: req.query.pageIdx,
            ownerId: req.query.ownerId || '',
        }
        
        console.log('🔍 Raw query params:', req.query)
        console.log('🔍 ownerId from query:', req.query.ownerId)
        console.log('📋 filterBy:', filterBy)
        
        // Validate ownerId if provided
        if (filterBy.ownerId && filterBy.ownerId.trim() === '') {
            console.log('❌ Empty ownerId provided, returning 400')
            return res.status(400).send({ err: 'Invalid ownerId parameter' })
        }
        
        const posts = await postService.query(filterBy)
        console.log(`📊 Found ${posts.length} posts`)
        
        if (filterBy.ownerId) {
            console.log('📊 Posts owner IDs:', posts.map(p => p.owner?._id).slice(0, 3))
            console.log('📊 Expected owner ID:', filterBy.ownerId)
            
            // Validate that all returned posts belong to the requested owner
            const invalidPosts = posts.filter(post => post.owner?._id !== filterBy.ownerId)
            if (invalidPosts.length > 0) {
                console.error('❌ Server: Found posts from other users!', {
                    invalidPosts: invalidPosts.map(p => ({ id: p._id, ownerId: p.owner?._id })),
                    expectedOwnerId: filterBy.ownerId
                })
                // Filter out invalid posts before sending response
                const validPosts = posts.filter(post => post.owner?._id === filterBy.ownerId)
                console.log(`📊 Filtered to ${validPosts.length} valid posts`)
                return res.json(validPosts)
            }
        }
        
        res.json(posts)
    } catch (err) {
        console.error('❌ Error in getPosts:', err)
        logger.error('Failed to get posts', err)
        res.status(400).send({ err: 'Failed to get posts' })
    }
}

export async function getFeedPosts(req, res) {
    try {
        console.log('🔍 getFeedPosts called')
        console.log('🔍 req.query:', req.query)
        console.log('🔍 req.params:', req.params)
        console.log('🔍 req.url:', req.url)
        
        // Get logged in user from asyncLocalStorage
        const { loggedinUser } = asyncLocalStorage.getStore()
        if (!loggedinUser) {
            console.log('❌ No loggedinUser found in getFeedPosts')
            return res.status(401).send({ err: 'Not authenticated' })
        }
        
        console.log('👤 Logged in user:', loggedinUser._id)
        
        const filterBy = {
            viewerId: loggedinUser._id,
            cursor: req.query.cursor || undefined,
            limit: Math.min(Math.max(Number(req.query.limit) || 10, 1), 20)
        }
        
        console.log('🔍 Feed query params:', req.query)
        console.log('📋 filterBy:', filterBy)
        
        const result = await postService.queryFeedPosts(filterBy)
        console.log(`📊 Feed returned ${result.posts.length} posts, hasMore: ${result.hasMore}`)
        
        res.json(result)
    } catch (err) {
        console.error('❌ Error in getFeedPosts:', err)
        logger.error('Failed to get feed posts', err)
        res.status(400).send({ err: 'Failed to get feed posts' })
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
        // Security: Always set owner from token, never trust client
        post.owner = {
            _id: loggedinUser._id,
            fullname: loggedinUser.fullname,
            imgUrl: loggedinUser.imgUrl,
            username: loggedinUser.username
        }
        
        // Add creation timestamp
        post.createdAt = new Date()
        
        // Initialize arrays for likes and messages
        post.likedBy = []
        post.msgs = []
        post.tags = []
        
        // Validate required fields
        if (!post.txt && !post.imgUrl && !post.videoUrl) {
            return res.status(400).send({ err: 'Post must have text, image, or video' })
        }
        
        // Set post type based on content
        if (post.videoUrl) {
            post.type = 'video'
        } else if (post.imgUrl) {
            post.type = 'image'
        } else {
            post.type = 'text'
        }
        
        console.log('📝 Creating post for user:', loggedinUser._id)
        console.log('📝 Post data:', { txt: post.txt, imgUrl: post.imgUrl, ownerId: post.owner._id })
        
        const addedPost = await postService.add(post)
        
        console.log('✅ Post created successfully:', addedPost._id)
        res.json(addedPost)
    } catch (err) {
        console.error('❌ Error creating post:', err)
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
        const { loggedinUser } = req
        const { _id: userId, isAdmin } = loggedinUser

        // First, get the post to check ownership
        const post = await postService.getById(postId)
        if (!post) {
            return res.status(404).send({ err: 'Post not found' })
        }

        // Check if user owns the post or is admin
        if (!isAdmin && post.owner._id !== userId) {
            return res.status(403).send({ err: 'Not your post...' })
        }

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

export async function addPostLike(req, res) {
    const { loggedinUser } = req

    try {
        console.log('❤️ addPostLike called by user:', loggedinUser._id)
        const postId = req.params.id
        const like = {
            _id: loggedinUser._id,
            fullname: loggedinUser.fullname,
            imgUrl: loggedinUser.imgUrl
        }
        const savedLike = await postService.addPostLike(postId, like)
        res.json(savedLike)
    } catch (err) {
        logger.error('Failed to add post like', err)
        res.status(400).send({ err: 'Failed to add post like' })
    }
}

export async function removePostLike(req, res) {
    const { loggedinUser } = req

    try {
        console.log('💔 removePostLike called by user:', loggedinUser._id)
        const postId = req.params.id
        const removedId = await postService.removePostLike(postId, loggedinUser._id)
        res.json({ removedId })
    } catch (err) {
        logger.error('Failed to remove post like', err)
        res.status(400).send({ err: 'Failed to remove post like' })
    }
}