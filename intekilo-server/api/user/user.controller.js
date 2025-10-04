import { logger } from '../../services/logger.service.js'
import { userService } from './user.service.js'

export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.json(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function getUserById(req, res) {
    try {
        const userId = req.params.id
        console.log('🔍 getUserById called with userId:', userId)
        console.log('🔍 Request URL:', req.url)
        console.log('🔍 Request params:', req.params)
        
        const user = await userService.getById(userId)
        
        if (!user) {
            console.log('❌ User not found with ID:', userId)
            return res.status(404).send({ err: 'User not found' })
        }
        
        console.log('✅ User found, returning:', { _id: user._id, username: user.username })
        res.json(user)
    } catch (err) {
        console.error('❌ Error in getUserById:', err)
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function updateUser(req, res) {
    const { loggedinUser, body: user } = req
    const { _id: userId, isAdmin } = loggedinUser

    if (!isAdmin && user._id !== userId) {
        res.status(403).send('Not your user...')
        return
    }

    try {
        const updatedUser = await userService.update(user)
        res.json(updatedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function updateBio(req, res) {
    const { loggedinUser, body: { bio }, params: { id: userId } } = req
    const { _id: loggedinUserId, isAdmin } = loggedinUser

    // Check if user is updating their own bio or is admin
    if (!isAdmin && userId !== loggedinUserId) {
        res.status(403).send('Not authorized to update this user\'s bio')
        return
    }

    try {
        const updatedUser = await userService.updateBio(userId, bio)
        res.json(updatedUser)
    } catch (err) {
        logger.error('Failed to update bio', err)
        res.status(400).send({ err: 'Failed to update bio' })
    }
}

export async function updateAvatar(req, res) {
    try {
        const { secureUrl, publicId } = req.body
        const { loggedinUser } = req

        // Validation
        if (!secureUrl) {
            return res.status(400).send({ err: 'secureUrl is required' })
        }

        // Validate Cloudinary URL
        if (!secureUrl.includes('cloudinary.com')) {
            return res.status(400).send({ err: 'Invalid image URL' })
        }

        // Security: User ID is derived from token, not from client
        const userId = loggedinUser._id

        logger.info(`Updating avatar for user ${userId}`, {
            userId,
            oldImgUrl: loggedinUser.imgUrl,
            newImgUrl: secureUrl,
            publicId
        })

        const updatedUser = await userService.updateAvatar(userId, {
            imgUrl: secureUrl,
            avatar: {
                publicId: publicId || null,
                updatedAt: new Date()
            }
        })

        logger.info(`Avatar updated successfully for user ${userId}`)
        res.json(updatedUser)
    } catch (err) {
        logger.error('Failed to update avatar', err)
        res.status(400).send({ err: 'Failed to update avatar' })
    }
}

export async function addSavedPost(req, res) {
    try {
        const { postId } = req.params
        const { loggedinUser } = req

        // Security: User ID is derived from token, not from client
        const userId = loggedinUser._id

        logger.info(`Adding saved post for user ${userId}`, {
            userId,
            postId
        })

        const updatedUser = await userService.addSavedPost(userId, postId)
        res.json(updatedUser)
    } catch (err) {
        logger.error('Failed to add saved post', err)
        res.status(400).send({ err: 'Failed to add saved post' })
    }
}

export async function removeSavedPost(req, res) {
    try {
        const { postId } = req.params
        const { loggedinUser } = req

        // Security: User ID is derived from token, not from client
        const userId = loggedinUser._id

        logger.info(`Removing saved post for user ${userId}`, {
            userId,
            postId
        })

        const updatedUser = await userService.removeSavedPost(userId, postId)
        res.json(updatedUser)
    } catch (err) {
        logger.error('Failed to remove saved post', err)
        res.status(400).send({ err: 'Failed to remove saved post' })
    }
}

export async function getSavedPosts(req, res) {
    try {
        const { offset = 0, limit = 20 } = req.query
        const { loggedinUser } = req

        // Check if user is authenticated
        if (!loggedinUser || !loggedinUser._id) {
            console.log('❌ getSavedPosts: No authenticated user found')
            return res.status(401).send({ err: 'Authentication required' })
        }

        // Security: User ID is derived from token, not from client
        const userId = loggedinUser._id

        console.log('🔍 getSavedPosts: Authenticated user:', {
            userId,
            username: loggedinUser.username,
            offset: parseInt(offset),
            limit: parseInt(limit)
        })

        const savedPosts = await userService.getSavedPosts(userId, parseInt(offset), parseInt(limit))
        
        console.log('✅ getSavedPosts: Successfully retrieved', savedPosts.length, 'saved posts')
        res.json(savedPosts)
    } catch (err) {
        console.error('❌ getSavedPosts: Error occurred:', err)
        logger.error('Failed to get saved posts', err)
        res.status(400).send({ err: 'Failed to get saved posts' })
    }
}

export async function removeUser(req, res) {
    try {
        const userId = req.params.id
        const removedId = await userService.remove(userId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove user', err)
        res.status(400).send({ err: 'Failed to remove user' })
    }
}

// Follow/Unfollow functions
export async function followUser(req, res) {
    console.log('🚀 followUser controller called')
    console.log('📋 Request details:', {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body
    })
    
    const { loggedinUser } = req
    const followerId = loggedinUser._id  // Get from token
    const { userId: followingId } = req.params

    try {
        console.log('👥 followUser API called:')
        console.log('  - loggedinUser:', loggedinUser)
        console.log('  - followerId (from token):', followerId)
        console.log('  - followingId (from URL):', followingId)
        
        if (!loggedinUser) {
            console.log('❌ No loggedinUser found')
            return res.status(401).send({ err: 'Not authenticated' })
        }
        
        if (!followingId) {
            console.log('❌ No followingId found in URL')
            return res.status(400).send({ err: 'Following ID not found' })
        }
        
        // Validation: Prevent self-follow
        if (followerId === followingId) {
            console.log('❌ Cannot follow yourself')
            return res.status(409).send({ err: 'Cannot follow yourself' })
        }
        
        console.log('🔄 Calling userService.followUser...')
        const result = await userService.followUser(followerId, followingId)
        console.log('✅ followUser result:', result)
        
        // Return formatted response with counters as specified
        if (result.message === 'Already following this user') {
            return res.status(409).send({ err: result.message })
        }
        
        // Get updated counts and return them
        const profileData = await userService.getProfileWithCounts(followingId)
        const response = {
            message: 'Successfully followed user',
            followersCount: profileData.followersCount,
            followingCount: profileData.followingCount
        }
        
        res.status(201).json(response)
    } catch (err) {
        console.log('❌ followUser error:', err)
        logger.error('Failed to follow user', err)
        
        // Check for specific error types
        if (err.message === 'Cannot follow yourself') {
            return res.status(409).send({ err: 'Cannot follow yourself' })
        }
        if (err.message === 'Follower not found') {
            return res.status(404).send({ err: 'User not found' })
        }
        
        res.status(400).send({ err: 'Failed to follow user' })
    }
}

export async function unfollowUser(req, res) {
    const { loggedinUser } = req
    const followerId = loggedinUser._id  // Get from token
    const { userId: followingId } = req.params

    try {
        console.log('👥 unfollowUser API called:', followerId, '->', followingId)
        
        // Validation: Prevent self-unfollow
        if (followerId === followingId) {
            console.log('❌ Cannot unfollow yourself')
            return res.status(409).send({ err: 'Cannot unfollow yourself' })
        }
        
        const result = await userService.unfollowUser(followerId, followingId)
        console.log('✅ unfollowUser result:', result)
        
        // Return formatted response with counters as specified
        if (result.message === 'Not following this user') {
            return res.status(409).send({ err: result.message })
        }
        
        // Get updated counts and return them
        const profileData = await userService.getProfileWithCounts(followingId)
        const response = {
            message: 'Successfully unfollowed user',
            followersCount: profileData.followersCount,
            followingCount: profileData.followingCount
        }
        
        res.status(200).json(response)
    } catch (err) {
        console.log('❌ unfollowUser error:', err)
        logger.error('Failed to unfollow user', err)
        
        // Check for specific error types
        if (err.message === 'Cannot unfollow yourself') {
            return res.status(409).send({ err: 'Cannot unfollow yourself' })
        }
        if (err.message === 'Follower not found') {
            return res.status(404).send({ err: 'User not found' })
        }
        
        res.status(400).send({ err: 'Failed to unfollow user' })
    }
}

export async function getFollowers(req, res) {
    try {
        const { userId } = req.params
        console.log('👥 getFollowers API called for user:', userId)
        const followers = await userService.getFollowers(userId)
        res.json(followers)
    } catch (err) {
        logger.error('Failed to get followers', err)
        res.status(400).send({ err: 'Failed to get followers' })
    }
}

export async function getFollowing(req, res) {
    try {
        const { userId } = req.params
        console.log('👥 getFollowing API called for user:', userId)
        const following = await userService.getFollowing(userId)
        res.json(following)
    } catch (err) {
        logger.error('Failed to get following', err)
        res.status(400).send({ err: 'Failed to get following' })
    }
}

export async function isFollowing(req, res) {
    try {
        const { loggedinUser } = req
        const followerId = loggedinUser._id  // Get from token
        const { userId: followingId } = req.params
        
        console.log('👥 isFollowing API called:')
        console.log('  - followerId (from token):', followerId)
        console.log('  - followingId (from URL):', followingId)
        
        const result = await userService.isFollowing(followerId, followingId)
        res.json(result)
    } catch (err) {
        logger.error('Failed to check following status', err)
        res.status(400).send({ err: 'Failed to check following status' })
    }
}

export async function removeFollower(req, res) {
    try {
        const { loggedinUser } = req
        const { userId: followerId } = req.params
        const userId = loggedinUser._id
        
        console.log('👥 removeFollower API called:')
        console.log('  - userId (logged in user):', userId)
        console.log('  - followerId (from URL):', followerId)
        
        const result = await userService.removeFollower(userId, followerId)
        res.json(result)
    } catch (err) {
        logger.error('Failed to remove follower', err)
        res.status(400).send({ err: 'Failed to remove follower' })
    }
}

export async function getProfileWithCounts(req, res) {
    try {
        const userId = req.params.id
        console.log('🔍 getProfileWithCounts called with userId:', userId)
        
        const profileData = await userService.getProfileWithCounts(userId)
        
        if (!profileData) {
            console.log('❌ Profile not found with ID:', userId)
            return res.status(404).send({ err: 'Profile not found' })
        }
        
        console.log('✅ Profile found with counts:', {
            _id: profileData._id,
            username: profileData.username,
            postsCount: profileData.postsCount,
            followersCount: profileData.followersCount,
            followingCount: profileData.followingCount
        })
        
        res.json(profileData)
    } catch (err) {
        console.error('❌ Error in getProfileWithCounts:', err)
        logger.error('Failed to get profile with counts', err)
        res.status(400).send({ err: 'Failed to get profile with counts' })
    }
}

export async function getRelationships(req, res) {
    try {
        const profileId = req.params.profileId
        console.log('🔗 getRelationships called for profileId:', profileId)
        
        // Verify the user exists
        const user = await userService.getById(profileId)
        if (!user) {
            console.log('❌ Profile not found with ID:', profileId)
            return res.status(404).send({ err: 'Profile not found' })
        }
        
        // Get followers data with minimal fields
        const followersData = await userService.getFollowers(profileId)
        const followers = followersData.map(follower => ({
            _id: follower._id,
            username: follower.username,
            imgUrl: follower.imgUrl
        }))
        
        // Get following data with minimal fields  
        const followingData = await userService.getFollowing(profileId)
        const following = followingData.map(followingUser => ({
            _id: followingUser._id,
            username: followingUser.username,
            imgUrl: followingUser.imgUrl
        }))
        
        const relationships = {
            profileId,
            followers,
            following,
            counts: {
                followers: followers.length,
                following: following.length
            }
        }
        
        console.log('✅ Relationships retrieved:', {
            profileId,
            followersCount: relationships.counts.followers,
            followingCount: relationships.counts.following
        })
        
        res.json(relationships)
    } catch (err) {
        console.error('❌ Error in getRelationships:', err)
        logger.error('Failed to get relationships', err)
        res.status(400).send({ err: 'Failed to get relationships' })
    }
}

export async function getFollowingStats(req, res) {
    try {
        const userId = req.params.userId
        console.log('📊 getFollowingStats called for userId:', userId)
        
        // Verify the user exists
        const user = await userService.getById(userId)
        if (!user) {
            console.log('❌ User not found with ID:', userId)
            return res.status(404).send({ err: 'User not found' })
        }
        
        const stats = await userService.getFollowingStats(userId)
        console.log('📊 Following stats result:', stats)
        
        res.json(stats)
    } catch (err) {
        console.error('❌ Error in getFollowingStats:', err)
        logger.error('Failed to get following stats', err)
        res.status(400).send({ err: 'Failed to get following stats' })
    }
}

export async function getSuggestedUsers(req, res) {
    try {
        const { loggedinUser } = req
        const { limit = 5 } = req.query
        
        // Check if user is authenticated
        if (!loggedinUser || !loggedinUser._id) {
            console.log('❌ getSuggestedUsers: No authenticated user found')
            return res.status(401).send({ err: 'Authentication required' })
        }
        
        const userId = loggedinUser._id
        console.log('🔍 getSuggestedUsers called for user:', userId, 'limit:', limit)
        
        const suggestedUsers = await userService.getSuggestedUsers(userId, parseInt(limit))
        
        console.log('✅ getSuggestedUsers: Successfully retrieved', suggestedUsers.length, 'suggested users')
        res.json(suggestedUsers)
    } catch (err) {
        console.error('❌ Error in getSuggestedUsers:', err)
        logger.error('Failed to get suggested users', err)
        res.status(400).send({ err: 'Failed to get suggested users' })
    }
}