import { httpService } from '../http.service'

export const commentService = {
  query,
  getByPostId,
  add,
  remove,
}

async function query() {
  try {
    console.log('🔍 Fetching all comments from API')
    return await httpService.get('comments')
  } catch (error) {
    console.error('❌ Error fetching comments:', error)
    throw error
  }
}

async function getByPostId(postId) {
  try {
    console.log('🔍 Fetching comments for post:', postId)
    return await httpService.get(`comments?postId=${postId}`)
  } catch (error) {
    console.error('❌ Error fetching comments for post:', error)
    throw error
  }
}

async function add(postId, txt) {
  try {
    console.log('➕ Adding comment to post:', postId)
    const comment = {
      postId,
      txt
    }
    const savedComment = await httpService.post('comments', comment)
    console.log('✅ Comment added successfully:', savedComment)
    return savedComment
  } catch (error) {
    console.error('❌ Error adding comment:', error)
    throw error
  }
}

async function remove(commentId) {
  try {
    console.log('🗑️ Removing comment:', commentId)
    await httpService.delete(`comments/${commentId}`)
    console.log('✅ Comment removed successfully')
  } catch (error) {
    console.error('❌ Error removing comment:', error)
    throw error
  }
}