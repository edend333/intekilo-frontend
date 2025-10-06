import { postService } from '../../services/post/post.service.js'

export const SET_POSTS = 'SET_POSTS'
export const ADD_POST = 'ADD_POST'
export const UPDATE_POST = 'UPDATE_POST'
export const REMOVE_POST = 'REMOVE_POST'
export const ADD_POST_LIKE = 'ADD_POST_LIKE'
export const REMOVE_POST_LIKE = 'REMOVE_POST_LIKE'

// Load all posts
export function loadPosts() {
  return async (dispatch, getState) => {
    try {
      // Check if user is authenticated before loading posts
      const isAuthenticated = getState().userModule?.isAuthenticated
      if (!isAuthenticated) {
        console.log('🚫 Not authenticated, skipping post loading')
        return []
      }

      const posts = await postService.query()
      dispatch({ type: SET_POSTS, posts })
      return posts
    } catch (err) {
      console.error('Cannot load posts:', err)
      throw err
    }
  }
}

// Load single post by ID
export function loadPostById(postId) {
  return async (dispatch, getState) => {
    try {
      // Check if post already exists in store
      const existingPost = getState().postModule.posts.find(p => p._id === postId)
      if (existingPost) {
        return existingPost
      }
      
      // Load post from server
      const post = await postService.getById(postId)
      dispatch({ type: ADD_POST, post })
      return post
    } catch (err) {
      console.error('Cannot load post by ID:', err)
      throw err
    }
  }
}

// Add a post
export function addPost(post) {
  return async (dispatch, getState) => {
    try {
      // Check if user is authenticated before adding post
      const isAuthenticated = getState().userModule?.isAuthenticated
      if (!isAuthenticated) {
        console.log('🚫 Not authenticated, cannot add post')
        throw new Error('Authentication required to add post')
      }

      const savedPost = await postService.add(post)
      dispatch({ type: ADD_POST, post: savedPost })
      
      // Update user's posts count if it's their own post
      const { userModule } = getState()
      const currentUser = userModule.user
      if (currentUser && savedPost.owner?._id === currentUser._id) {
        // Import setUser action dynamically to avoid circular dependency
        const { setUser } = await import('../user.actions')
        dispatch(setUser({
          ...currentUser,
          postsCount: (currentUser.postsCount || 0) + 1
        }))
      }
      
      return savedPost
    } catch (err) {
      console.error('Cannot add post:', err)
      throw err
    }
  }
}

// Update a post
export function updatePost(post) {
  return async (dispatch) => {
    try {
      const updatedPost = await postService.update(post)
      dispatch({ type: UPDATE_POST, post: updatedPost })
      return updatedPost
    } catch (err) {
      console.error('Cannot update post:', err)
      throw err
    }
  }
}

// Remove a post
export function removePost(postId) {
  return async (dispatch, getState) => {
    try {
      console.log('🗑️ removePost action called with postId:', postId)
      
      // Get post info before removing to update user's posts count
      const { postModule, userModule } = getState()
      const postToRemove = postModule.posts.find(p => p._id === postId)
      const currentUser = userModule.user
      
      console.log('🗑️ Found post to remove:', postToRemove ? 'YES' : 'NO')
      console.log('🗑️ Current posts count:', postModule.posts.length)
      console.log('🗑️ Post IDs in store:', postModule.posts.map(p => p._id))
      
      await postService.remove(postId)
      console.log('🗑️ Post removed from server successfully')
      
      dispatch({ type: REMOVE_POST, postId })
      console.log('🗑️ REMOVE_POST action dispatched')
      
      // Update user's posts count if it's their own post
      if (currentUser && postToRemove?.owner?._id === currentUser._id) {
        console.log('🗑️ Updating user posts count')
        // Import setUser action dynamically to avoid circular dependency
        const { setUser } = await import('../user.actions')
        dispatch(setUser({
          ...currentUser,
          postsCount: Math.max(0, (currentUser.postsCount || 0) - 1)
        }))
      }
      
      console.log('✅ Post removal completed successfully')
    } catch (err) {
      console.error('❌ Cannot remove post:', err)
      throw err
    }
  }
}

// Add like to post
export function addPostLike(postId) {
  return async (dispatch, getState) => {
    try {
      console.log('🚀 addPostLike action - postId:', postId)
      
      // Get current user and post for optimistic update
      const { userModule, postModule } = getState()
      const currentUser = userModule.user
      
      if (!currentUser) {
        throw new Error('User not found')
      }
      
      // Find post in store - try both exact match and fallback to any post
      let currentPost = postModule.posts.find(p => p._id === postId)
      
      // If post not found in store, we'll still proceed with the API call
      // The server will handle the validation
      if (!currentPost) {
        console.log('⚠️ Post not found in store, proceeding with API call')
      }
      
      // Optimistic update - add like immediately (only if post exists in store)
      if (currentPost) {
        const optimisticLike = {
          _id: currentUser._id,
          fullname: currentUser.fullname,
          imgUrl: currentUser.imgUrl,
          username: currentUser.username
        }
        
        dispatch({ type: ADD_POST_LIKE, postId, like: optimisticLike })
      }
      
      // Make API call
      const like = await postService.addLike(postId)
      console.log('✅ addPostLike action - received:', like)
      
      // If post wasn't in store, dispatch a custom event for components to update
      if (!currentPost) {
        console.log('📡 Dispatching postLikeAdded event for external components')
        window.dispatchEvent(new CustomEvent('postLikeAdded', {
          detail: { postId, like, action: 'add' }
        }))
      }
      
      return like
    } catch (err) {
      console.error('Cannot add post like:', err)
      
      // Revert optimistic update on error (only if we had a post in store)
      const { userModule, postModule } = getState()
      const currentUser = userModule.user
      const currentPost = postModule.posts.find(p => p._id === postId)
      
      if (currentUser && currentPost) {
        dispatch({ type: REMOVE_POST_LIKE, postId, userId: currentUser._id })
      }
      
      throw err
    }
  }
}

// Remove like from post
export function removePostLike(postId) {
  return async (dispatch, getState) => {
    try {
      console.log('🚀 removePostLike action - postId:', postId)
      
      // Get current user for optimistic update
      const { userModule, postModule } = getState()
      const currentUser = userModule.user
      
      if (!currentUser) {
        throw new Error('User not found')
      }
      
      // Find post in store
      const currentPost = postModule.posts.find(p => p._id === postId)
      
      // Optimistic update - remove like immediately (only if post exists in store)
      if (currentPost) {
        dispatch({ type: REMOVE_POST_LIKE, postId, userId: currentUser._id })
      }
      
      // Make API call
      const result = await postService.removeLike(postId)
      console.log('✅ removePostLike action - received:', result)
      
      // If post wasn't in store, dispatch a custom event for components to update
      if (!currentPost) {
        console.log('📡 Dispatching postLikeRemoved event for external components')
        window.dispatchEvent(new CustomEvent('postLikeRemoved', {
          detail: { postId, userId: currentUser._id, action: 'remove' }
        }))
      }
      
      return result
    } catch (err) {
      console.error('Cannot remove post like:', err)
      
      // Revert optimistic update on error (only if we had a post in store)
      const { userModule, postModule } = getState()
      const currentUser = userModule.user
      const currentPost = postModule.posts.find(p => p._id === postId)
      
      if (currentUser && currentPost) {
        const optimisticLike = {
          _id: currentUser._id,
          fullname: currentUser.fullname,
          imgUrl: currentUser.imgUrl,
          username: currentUser.username
        }
        dispatch({ type: ADD_POST_LIKE, postId, like: optimisticLike })
      }
      
      throw err
    }
  }
}
