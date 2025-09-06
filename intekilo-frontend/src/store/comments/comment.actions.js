import { commentService } from '../../services/comment/comment.service.js'
import { store } from '../store.js'

export const SET_COMMENTS = 'SET_COMMENTS'
export const ADD_COMMENT = 'ADD_COMMENT'
export const REMOVE_COMMENT = 'REMOVE_COMMENT'


export async function loadAllComments() {
  try {
    const comments = await commentService.query() 
    store.dispatch({ type: SET_COMMENTS, comments })
    return comments
  } catch (err) {
    console.error('Cannot load all comments:', err)
    throw err
  }
}

// Load all comments for a specific post
export async function loadComments(postId) {
  try {
    const comments = await commentService.getByPostId(postId)
    store.dispatch({ type: SET_COMMENTS, comments })
    return comments
  } catch (err) {
    console.error('Cannot load comments:', err)
    throw err
  }
}

// Add a comment to a post
export async function addComment(postId, txt) {

  try {
    const savedComment = await commentService.add(postId, txt)
    store.dispatch({ type: ADD_COMMENT, comment: savedComment })
    return savedComment
  } catch (err) {
    console.error('Cannot add comment:', err)
    throw err
  }
}

// Remove a comment
export async function removeComment(commentId) {
  try {
    await commentService.remove(commentId)
    store.dispatch({ type: REMOVE_COMMENT, commentId })
  } catch (err) {
    console.error('Cannot remove comment:', err)
    throw err
  }
}
