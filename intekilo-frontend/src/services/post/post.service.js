import { httpService } from '../http.service'

export const postService = {
  query,
  getById,
  add,
  update,
  remove,
  addLike,
  removeLike,
  getPostsByOwner,
}

async function query() {
  try {
    console.log('🔍 Fetching all posts from API')
    return await httpService.get('posts')
  } catch (error) {
    console.error('❌ Error fetching posts:', error)
    throw error
  }
}

async function getById(postId) {
  try {
    console.log('🔍 Fetching post:', postId)
    return await httpService.get(`post/${postId}`)
  } catch (error) {
    console.error('❌ Error fetching post:', error)
    throw error
  }
}

async function add(post) {
  try {
    console.log('➕ Adding post:', post)
    return await httpService.post('posts', post)
  } catch (error) {
    console.error('❌ Error adding post:', error)
    throw error
  }
}

async function update(post) {
  try {
    console.log('✏️ Updating post:', post._id)
    return await httpService.put(`posts/${post._id}`, post)
  } catch (error) {
    console.error('❌ Error updating post:', error)
    throw error
  }
}

async function remove(postId) {
  try {
    console.log('🗑️ Removing post:', postId)
    return await httpService.delete(`posts/${postId}`)
  } catch (error) {
    console.error('❌ Error removing post:', error)
    throw error
  }
}

async function addLike(postId) {
  try {
    console.log('❤️ Adding like to post:', postId)
    const result = await httpService.post(`posts/${postId}/like`)
    console.log('✅ Like added successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Error adding like:', error)
    throw error
  }
}

async function removeLike(postId) {
  try {
    console.log('💔 Removing like from post:', postId)
    const result = await httpService.delete(`posts/${postId}/like`)
    console.log('✅ Like removed successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Error removing like:', error)
    throw error
  }
}

async function getPostsByOwner(ownerId) {
  try {
    console.log('🔍 Fetching posts for owner:', ownerId)
    const posts = await httpService.get(`posts?ownerId=${ownerId}`)
    
    // Validate that all posts belong to the requested owner
    const invalidPosts = posts.filter(post => post.owner?._id !== ownerId)
    if (invalidPosts.length > 0) {
      console.warn('⚠️ Found posts from other users, filtering them out:', invalidPosts.length)
      return posts.filter(post => post.owner?._id === ownerId)
    }
    
    return posts
  } catch (error) {
    console.error('❌ Error fetching posts by owner:', error)
    throw error
  }
}
