import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const userService = {
    remove,
    query,
    getById,
    update,
    updateBio,
    updateAvatar,
    addSavedPost,
    removeSavedPost,
    getSavedPosts,
    getByUsername,
    getByEmail,
    add,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    removeFollower,
    isFollowing,
    getProfileWithCounts,
    getFollowingStats,
    getSuggestedUsers
}

async function query() {
    try {
        const collection = await dbService.getCollection('users')
        const users = await collection.find({}).toArray()
        
        // Ensure bio field exists for all users
        users.forEach(user => {
            if (!user.bio) {
                user.bio = ''
            }
        })
        
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        console.log('🔍 getById called with userId:', userId)
        console.log('🔍 userId type:', typeof userId)
        
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        console.log('🔍 Search criteria:', criteria)

        const collection = await dbService.getCollection('users')
        const user = await collection.findOne(criteria)

        console.log('🔍 Query result:', user ? 'FOUND' : 'NOT FOUND')
        if (user) {
            console.log('🔍 Found user:', { _id: user._id, username: user.username })
        }

        if (!user) {
            console.log('❌ User not found with ID:', userId)
            return null
        }

        // Ensure bio field exists
        if (!user.bio) {
            user.bio = ''
        }

        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function remove(userId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

    try {
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        if (!isAdmin) criteria._id = ownerId

        const collection = await dbService.getCollection('users')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw ('Not your user')
        return userId
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    const userToSave = { 
        username: user.username, 
        fullname: user.fullname, 
        imgUrl: user.imgUrl,
        bio: user.bio || ''
    }

    try {
        // Handle both string IDs and ObjectId
        const criteria = user._id.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(user._id) }
            : { _id: user._id }

        const collection = await dbService.getCollection('users')
        await collection.updateOne(criteria, { $set: userToSave })

        return user
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function updateBio(userId, bio) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        const collection = await dbService.getCollection('users')
        await collection.updateOne(criteria, { $set: { bio } })

        // Return the updated user
        const updatedUser = await collection.findOne(criteria)
        return updatedUser
    } catch (err) {
        logger.error(`cannot update bio for user ${userId}`, err)
        throw err
    }
}

async function updateAvatar(userId, avatarData) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        const collection = await dbService.getCollection('users')
        
        // Get current user to check for old avatar
        const currentUser = await collection.findOne(criteria)
        if (!currentUser) {
            throw new Error('User not found')
        }

        // Update avatar data
        const updateData = {
            imgUrl: avatarData.imgUrl,
            avatar: avatarData.avatar,
            updatedAt: new Date()
        }

        await collection.updateOne(criteria, { $set: updateData })

        // Update user avatar in all existing posts
        try {
            const { postService } = await import('../post/post.service.js')
            await postService.updateUserAvatarInPosts(userId, avatarData.imgUrl)
        } catch (err) {
            logger.error(`Failed to update user avatar in posts for user ${userId}`, err)
            // Don't throw - user update succeeded, post update is secondary
        }

        // Update user avatar in all existing comments
        try {
            const { commentService } = await import('../comment/comment.service.js')
            await commentService.updateUserAvatarInComments(userId, avatarData.imgUrl)
        } catch (err) {
            logger.error(`Failed to update user avatar in comments for user ${userId}`, err)
            // Don't throw - user update succeeded, comment update is secondary
        }

        // Return the updated user
        const updatedUser = await collection.findOne(criteria)
        
        logger.info(`Avatar updated for user ${userId}`, {
            oldImgUrl: currentUser.imgUrl,
            newImgUrl: avatarData.imgUrl,
            publicId: avatarData.avatar?.publicId
        })

        return updatedUser
    } catch (err) {
        logger.error(`cannot update avatar for user ${userId}`, err)
        throw err
    }
}

async function addSavedPost(userId, postId) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        const collection = await dbService.getCollection('users')
        
        // Get current user
        const currentUser = await collection.findOne(criteria)
        if (!currentUser) {
            throw new Error('User not found')
        }

        // Initialize savedPostIds if it doesn't exist
        const savedPostIds = currentUser.savedPostIds || []
        
        // Validate postId format
        if (!postId || typeof postId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(postId)) {
            throw new Error('Invalid postId format')
        }

        const postObjectId = new ObjectId(postId)

        // Check if post is already saved
        const isPostSaved = savedPostIds.some(savedId => 
            savedId.toString() === postObjectId.toString()
        )
        
        if (isPostSaved) {
            // Idempotent - return current user
            return currentUser
        }

        // Add postId to saved list (as string for consistency)
        const updatedSavedPostIds = [...savedPostIds, postId]
        
        // Limit to 10K posts (performance consideration)
        if (updatedSavedPostIds.length > 10000) {
            throw new Error('Maximum saved posts limit reached')
        }

        await collection.updateOne(criteria, { 
            $set: { 
                savedPostIds: updatedSavedPostIds,
                updatedAt: new Date()
            } 
        })

        // Return the updated user
        const updatedUser = await collection.findOne(criteria)
        
        logger.info(`Added saved post for user ${userId}`, {
            postId,
            totalSaved: updatedSavedPostIds.length
        })

        return updatedUser
    } catch (err) {
        logger.error(`cannot add saved post for user ${userId}`, err)
        throw err
    }
}

async function removeSavedPost(userId, postId) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        const collection = await dbService.getCollection('users')
        
        // Get current user
        const currentUser = await collection.findOne(criteria)
        if (!currentUser) {
            throw new Error('User not found')
        }

        // Initialize savedPostIds if it doesn't exist
        const savedPostIds = currentUser.savedPostIds || []
        
        // Validate postId format
        if (!postId || typeof postId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(postId)) {
            throw new Error('Invalid postId format')
        }

        const postObjectId = new ObjectId(postId)

        // Check if post is saved
        const isPostSaved = savedPostIds.some(savedId => 
            savedId.toString() === postObjectId.toString()
        )
        
        if (!isPostSaved) {
            // Idempotent - return current user
            return currentUser
        }

        // Remove postId from saved list
        const updatedSavedPostIds = savedPostIds.filter(id => 
            id.toString() !== postObjectId.toString()
        )

        await collection.updateOne(criteria, { 
            $set: { 
                savedPostIds: updatedSavedPostIds,
                updatedAt: new Date()
            } 
        })

        // Return the updated user
        const updatedUser = await collection.findOne(criteria)
        
        logger.info(`Removed saved post for user ${userId}`, {
            postId,
            totalSaved: updatedSavedPostIds.length
        })

        return updatedUser
    } catch (err) {
        logger.error(`cannot remove saved post for user ${userId}`, err)
        throw err
    }
}

async function getSavedPosts(userId, offset = 0, limit = 20) {
    try {
        console.log('🔍 getSavedPosts called with:', { userId, offset, limit })
        
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }

        console.log('🔍 User criteria:', criteria)

        const collection = await dbService.getCollection('users')
        
        // Get user with saved posts
        const user = await collection.findOne(criteria)
        console.log('🔍 Found user:', user ? { _id: user._id, username: user.username } : 'NOT FOUND')
        
        if (!user) {
            throw new Error('User not found')
        }

        const savedPostIds = user.savedPostIds || []
        console.log('🔍 Saved post IDs:', savedPostIds)
        
        if (savedPostIds.length === 0) {
            console.log('📝 No saved posts found, returning empty array')
            return []
        }
        
        // Get posts collection
        const postsCollection = await dbService.getCollection('posts')
        
        // Filter and convert only valid ObjectIds
        const validObjectIds = savedPostIds
            .filter(id => {
                // Handle both string and ObjectId types
                let idString
                if (typeof id === 'string') {
                    idString = id
                } else if (id && typeof id.toString === 'function') {
                    idString = id.toString()
                } else {
                    console.log('⚠️ Invalid savedPostId found:', id, 'type:', typeof id)
                    return false
                }
                
                // Check if it's a valid ObjectId string (24 hex characters)
                const isValid = /^[0-9a-fA-F]{24}$/.test(idString)
                if (!isValid) {
                    console.log('⚠️ Invalid savedPostId format:', idString, 'type:', typeof id)
                }
                return isValid
            })
            .map(id => {
                // Convert to ObjectId, handling both string and ObjectId types
                if (typeof id === 'string') {
                    return new ObjectId(id)
                } else {
                    return id // Already an ObjectId
                }
            })

        console.log('🔍 Valid Object IDs for query:', validObjectIds.length, 'out of', savedPostIds.length)

        // If no valid IDs, return empty array
        if (validObjectIds.length === 0) {
            console.log('📝 No valid saved post IDs found, returning empty array')
            return []
        }

        // Get saved posts with pagination
        const savedPosts = await postsCollection
            .find({ _id: { $in: validObjectIds } })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .toArray()

        console.log('🔍 Found saved posts:', savedPosts.length)

        // Clean up invalid post IDs (both non-existent posts and invalid ObjectIds)
        const validPostIds = savedPosts.map(post => post._id.toString())
        const invalidPostIds = savedPostIds.filter(id => {
            // Handle both string and ObjectId types
            let idString
            if (typeof id === 'string') {
                idString = id
            } else if (id && typeof id.toString === 'function') {
                idString = id.toString()
            } else {
                return true // Remove invalid types
            }
            
            // Check if it's a valid ObjectId format
            const isValidFormat = /^[0-9a-fA-F]{24}$/.test(idString)
            if (!isValidFormat) {
                return true // Remove invalid format IDs
            }
            // Check if the post exists
            return !validPostIds.includes(idString)
        })
        
        if (invalidPostIds.length > 0) {
            console.log('🧹 Cleaning up invalid post IDs:', invalidPostIds)
            // Clean up invalid post IDs - keep only valid ObjectIds that exist in posts
            const cleanedSavedPostIds = savedPostIds.filter(id => {
                // Handle both string and ObjectId types
                let idString
                if (typeof id === 'string') {
                    idString = id
                } else if (id && typeof id.toString === 'function') {
                    idString = id.toString()
                } else {
                    return false // Remove invalid types
                }
                
                const isValidFormat = /^[0-9a-fA-F]{24}$/.test(idString)
                return isValidFormat && validPostIds.includes(idString)
            })
            
            await collection.updateOne(criteria, { 
                $set: { 
                    savedPostIds: cleanedSavedPostIds,
                    updatedAt: new Date()
                } 
            })
            
            logger.info(`Cleaned up invalid saved posts for user ${userId}`, {
                removedIds: invalidPostIds,
                remainingIds: cleanedSavedPostIds.length
            })
        }

        logger.info(`Retrieved saved posts for user ${userId}`, {
            offset,
            limit,
            returned: savedPosts.length,
            total: savedPostIds.length
        })

        return savedPosts
    } catch (err) {
        console.error('❌ getSavedPosts error:', err)
        logger.error(`cannot get saved posts for user ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username ${username}`, err)
        throw err
    }
}

async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        logger.error(`while finding user by email ${email}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // Ensure bio field exists
        if (!user.bio) {
            user.bio = ''
        }
        
        const collection = await dbService.getCollection('users')
        const result = await collection.insertOne(user)
        return user
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

// Follow/Unfollow functions
async function followUser(followerId, followingId) {
    try {
        console.log('👥 followUser service called:', followerId, '->', followingId)
        
        if (followerId === followingId) {
            console.log('❌ Cannot follow yourself')
            throw new Error('Cannot follow yourself')
        }

        console.log('🔄 Getting MongoDB collection...')
        const collection = await dbService.getCollection('users')
        console.log('📊 Collection obtained:', collection ? 'SUCCESS' : 'FAILED')
        
        // Handle both ObjectId and custom string IDs
        const followerCriteria = followerId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(followerId) }
            : { _id: followerId }
        
        const followingCriteria = followingId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(followingId) }
            : { _id: followingId }

        console.log('🔍 Follower criteria:', followerCriteria)
        console.log('🔍 Following criteria:', followingCriteria)
        
        // Check if already following
        console.log('🔍 Looking for follower:', followerId)
        const follower = await collection.findOne(followerCriteria)
        console.log('🔍 Follower found:', follower ? follower._id : 'NOT FOUND')
        
        if (!follower) {
            console.log('❌ Follower not found')
            throw new Error('Follower not found')
        }
        
        if (follower.following?.includes(followingId)) {
            console.log('⚠️ Already following this user')
            return { message: 'Already following this user' }
        }

        console.log('🔄 Adding to follower\'s following list...')
        // Add to follower's following list
        await collection.updateOne(
            followerCriteria,
            { $addToSet: { following: followingId } }
        )

        console.log('🔄 Adding to following user\'s followers list...')
        // Add to following user's followers list
        await collection.updateOne(
            followingCriteria,
            { $addToSet: { followers: followerId } }
        )

        console.log('✅ Follow successful')
        return { message: 'Successfully followed user' }
    } catch (err) {
        console.log('❌ followUser service error:', err)
        logger.error('Cannot follow user', err)
        throw err
    }
}

async function unfollowUser(followerId, followingId) {
    try {
        console.log('👥 unfollowUser called:', followerId, '->', followingId)
        
        if (followerId === followingId) {
            throw new Error('Cannot unfollow yourself')
        }

        // Handle both ObjectId and custom string IDs
        const followerCriteria = followerId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(followerId) }
            : { _id: followerId }
        
        const followingCriteria = followingId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(followingId) }
            : { _id: followingId }

        const collection = await dbService.getCollection('users')
        
        // Check if currently following
        const follower = await collection.findOne(followerCriteria)
        if (!follower) {
            throw new Error('Follower not found')
        }
        
        if (!follower.following?.includes(followingId)) {
            console.log('⚠️ Not following this user')
            return { message: 'Not following this user' }
        }

        // Remove from follower's following list
        await collection.updateOne(
            followerCriteria,
            { $pull: { following: followingId } }
        )

        // Remove from following user's followers list
        await collection.updateOne(
            followingCriteria,
            { $pull: { followers: followerId } }
        )

        console.log('✅ Unfollow successful')
        return { message: 'Successfully unfollowed user' }
    } catch (err) {
        logger.error('Cannot unfollow user', err)
        throw err
    }
}

async function getFollowers(userId) {
    try {
        console.log('👥 getFollowers called for user:', userId)
        console.log('👥 userId type:', typeof userId)
        const collection = await dbService.getCollection('users')
        
        // Handle both ObjectId and string formats - same logic as getById
        const userCriteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }
        
        console.log('👥 User search criteria:', userCriteria)
        const user = await collection.findOne(userCriteria)
        if (!user) {
            console.log('❌ User not found with criteria:', userCriteria)
            throw new Error('User not found')
        }

        console.log('✅ Found user:', { _id: user._id, username: user.username })

        // Handle both ObjectId and string formats for followers array
        const followersIds = user.followers || []
        console.log('🔍 User followers array:', followersIds)
        console.log('🔍 Followers IDs type:', typeof followersIds[0])
        
        // Convert string IDs to ObjectId for proper matching
        const objectIds = followersIds.map(id => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                return new ObjectId(id)
            }
            return id
        })
        console.log('🔧 Converted followers IDs to ObjectIds:', objectIds)
        
        const followers = await collection.find({ 
            _id: { $in: objectIds } 
        }).toArray()

        console.log(`📊 Found ${followers.length} followers`)
        console.log('🔍 Followers users:', followers.map(u => ({ _id: u._id, username: u.username })))
        return followers
    } catch (err) {
        console.error('❌ getFollowers error:', err)
        logger.error('Cannot get followers', err)
        throw err
    }
}

async function getFollowing(userId) {
    try {
        console.log('👥 getFollowing called for user:', userId)
        console.log('👥 userId type:', typeof userId)
        const collection = await dbService.getCollection('users')
        
        // Handle both ObjectId and string formats - same logic as getById
        const userCriteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }
        
        console.log('👥 User search criteria:', userCriteria)
        const user = await collection.findOne(userCriteria)
        if (!user) {
            console.log('❌ User not found with criteria:', userCriteria)
            throw new Error('User not found')
        }

        console.log('✅ Found user:', { _id: user._id, username: user.username })

        // Handle both ObjectId and string formats for following array
        const followingIds = user.following || []
        console.log('🔍 User following array:', followingIds)
        console.log('🔍 Following IDs type:', typeof followingIds[0])
        
        // Convert string IDs to ObjectId for proper matching
        const objectIds = followingIds.map(id => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                return new ObjectId(id)
            }
            return id
        })
        console.log('🔧 Converted following IDs to ObjectIds:', objectIds)
        
        const following = await collection.find({ 
            _id: { $in: objectIds } 
        }).toArray()

        console.log(`📊 Found ${following.length} following`)
        console.log('🔍 Following users:', following.map(u => ({ _id: u._id, username: u.username })))
        return following
    } catch (err) {
        console.error('❌ getFollowing error:', err)
        logger.error('Cannot get following', err)
        throw err
    }
}

async function removeFollower(userId, followerId) {
    try {
        console.log('👥 removeFollower called:', userId, '<-', followerId)
        const collection = await dbService.getCollection('users')
        
        // Handle both ObjectId and custom string IDs
        const userCriteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }
        
        const followerCriteria = followerId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(followerId) }
            : { _id: followerId }
        
        const user = await collection.findOne(userCriteria)
        if (!user) {
            throw new Error('User not found')
        }

        const follower = await collection.findOne(followerCriteria)
        if (!follower) {
            throw new Error('Follower not found')
        }

        // Check if follower is actually following this user
        if (!user.followers?.includes(followerId)) {
            console.log('⚠️ User is not following this user')
            return { message: 'User is not following this user' }
        }

        // Remove from user's followers list
        await collection.updateOne(
            userCriteria,
            { $pull: { followers: followerId } }
        )

        // Remove from follower's following list
        await collection.updateOne(
            followerCriteria,
            { $pull: { following: userId } }
        )

        console.log('✅ Remove follower successful')
        return { message: 'Successfully removed follower' }
    } catch (err) {
        logger.error('Cannot remove follower', err)
        throw err
    }
}

async function isFollowing(followerId, followingId) {
    try {
        console.log('👥 isFollowing called:', followerId, '->', followingId)
        const collection = await dbService.getCollection('users')
        
        // Handle both ObjectId and custom string IDs
        const followerCriteria = followerId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(followerId) }
            : { _id: followerId }
        
        console.log('🔍 Follower criteria:', followerCriteria)
        
        const follower = await collection.findOne(followerCriteria)
        if (!follower) {
            throw new Error('Follower not found')
        }

        const isFollowing = follower.following?.includes(followingId) || false
        console.log('📊 Is following:', isFollowing)
        return { isFollowing }
    } catch (err) {
        logger.error('Cannot check following status', err)
        throw err
    }
}

async function getProfileWithCounts(userId) {
    try {
        console.log('🔍 getProfileWithCounts called with userId:', userId)
        console.log('🔍 userId type:', typeof userId)
        
        // Get user basic info
        const user = await getById(userId)
        if (!user) {
            console.log('❌ User not found in getProfileWithCounts')
            throw new Error('User not found')
        }
        
        // Count posts
        const postsCollection = await dbService.getCollection('posts')
        const postsCount = await postsCollection.countDocuments({ 
            'owner._id': userId 
        })
        
        // Count followers and following from user document
        const followersCount = user.followers?.length || 0
        const followingCount = user.following?.length || 0
        
        console.log('🔍 User followers array:', user.followers)
        console.log('🔍 User following array:', user.following)
        console.log('📊 Profile counts:', {
            userId,
            postsCount,
            followersCount,
            followingCount
        })
        
        return {
            ...user,
            postsCount,
            followersCount,
            followingCount
        }
    } catch (err) {
        logger.error('Cannot get profile with counts', err)
        throw err
    }
}
async function getFollowingStats(userId) {
    try {
        console.log('📊 getFollowingStats called for user:', userId)
        
        const collection = await dbService.getCollection('users')
        const postsCollection = await dbService.getCollection('posts')
        
        // Handle both ObjectId and string formats
        const userCriteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }
        
        console.log('📊 User search criteria:', userCriteria)
        
        // Get user's following list
        const user = await collection.findOne(userCriteria)
        if (!user) {
            console.log('❌ User not found with criteria:', userCriteria)
            throw new Error('User not found')
        }

        const followingIds = user.following || []
        console.log('📊 User following IDs:', followingIds)
        console.log('📊 Following count:', followingIds.length)
        
        // If user has no following, return empty stats
        if (followingIds.length === 0) {
            console.log('📭 User has no following, returning empty stats')
            return {
                followingCount: 0,
                totalPostsFromFollowing: 0
            }
        }

        // Convert all following IDs to strings (posts are stored with string owner._id)
        const stringFollowingIds = followingIds.map(id => {
            // If it's an ObjectId, convert to string
            if (id && typeof id === 'object' && id.toString) {
                return id.toString()
            }
            // If it's already a string, return as is
            return String(id)
        })
        
        console.log('🔧 Converted following IDs to strings:', stringFollowingIds)
        
        // Count total posts from following users using string IDs
        const totalPostsFromFollowing = await postsCollection.countDocuments({ 
            'owner._id': { $in: stringFollowingIds } 
        })
        
        console.log('📊 Total posts from following users:', totalPostsFromFollowing)
        
        // Also check individual counts for debugging
        for (const followingId of stringFollowingIds) {
            const stringCount = await postsCollection.countDocuments({ 'owner._id': followingId })
            console.log(`📊 Posts count for user ${followingId}: ${stringCount}`)
        }
        
        return {
            followingCount: followingIds.length,
            totalPostsFromFollowing
        }
    } catch (err) {
        console.error('❌ Error in getFollowingStats:', err)
        logger.error('Cannot get following stats', err)
        throw err
    }
}

async function getSuggestedUsers(userId, limit = 5) {
    try {
        console.log('🔍 getSuggestedUsers called for user:', userId, 'limit:', limit)
        
        const collection = await dbService.getCollection('users')
        
        // Handle both ObjectId and string formats
        const userCriteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: new ObjectId(userId) }
            : { _id: userId }
        
        console.log('🔍 User search criteria:', userCriteria)
        
        // Get current user to check their following list
        const user = await collection.findOne(userCriteria)
        if (!user) {
            console.log('❌ User not found with criteria:', userCriteria)
            throw new Error('User not found')
        }

        console.log('✅ Found user:', { _id: user._id, username: user.username })
        
        // Get user's following list (users they already follow)
        const followingIds = user.following || []
        console.log('🔍 User following IDs:', followingIds)
        
        // Build exclusion criteria: exclude current user and users they already follow
        const excludeIds = [userId, ...followingIds]
        console.log('🔍 Excluding user IDs:', excludeIds)
        
        // Convert exclude IDs to ObjectIds for proper matching
        const excludeObjectIds = excludeIds.map(id => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                return new ObjectId(id)
            }
            return id
        })
        
        console.log('🔧 Converted exclude IDs to ObjectIds:', excludeObjectIds)
        
        // Get suggested users (random selection, excluding current user and following)
        const suggestedUsers = await collection
            .aggregate([
                {
                    $match: {
                        _id: { $nin: excludeObjectIds }
                    }
                },
                {
                    $sample: { size: limit }
                },
                {
                    $project: {
                        _id: 1,
                        username: 1,
                        fullname: 1,
                        imgUrl: 1,
                        bio: 1
                    }
                }
            ])
            .toArray()

        // If we don't have enough users, get all available users (excluding current user and following)
        if (suggestedUsers.length < limit) {
            console.log(`📊 Only found ${suggestedUsers.length} users, getting all available users`)
            const allAvailableUsers = await collection
                .find(
                    { _id: { $nin: excludeObjectIds } },
                    {
                        projection: {
                            _id: 1,
                            username: 1,
                            fullname: 1,
                            imgUrl: 1,
                            bio: 1
                        }
                    }
                )
                .toArray()
            
            // Shuffle and take up to the limit
            const shuffled = allAvailableUsers.sort(() => 0.5 - Math.random())
            const result = shuffled.slice(0, limit)
            
            // Ensure bio field exists for all users
            result.forEach(user => {
                if (!user.bio) {
                    user.bio = ''
                }
            })
            
            return result
        }

        console.log(`📊 Found ${suggestedUsers.length} suggested users`)
        console.log('🔍 Suggested users:', suggestedUsers.map(u => ({ _id: u._id, username: u.username })))
        
        // Ensure bio field exists for all suggested users
        suggestedUsers.forEach(user => {
            if (!user.bio) {
                user.bio = ''
            }
        })
        
        return suggestedUsers
    } catch (err) {
        console.error('❌ Error in getSuggestedUsers:', err)
        logger.error('Cannot get suggested users', err)
        throw err
    }
}