import { commentService } from '../../services/comment/comment.service.js'

export const SET_COMMENTS = 'SET_COMMENTS'
export const ADD_COMMENT = 'ADD_COMMENT'
export const REMOVE_COMMENT = 'REMOVE_COMMENT'

// Load all comments
export function loadAllComments() {
  return async (dispatch) => {
    try {
      const comments = await commentService.query() 
      dispatch({ type: SET_COMMENTS, comments })
      return comments
    } catch (err) {
      console.error('Cannot load all comments:', err)
      throw err
    }
  }
}

// Load all comments for a specific post
export function loadComments(postId) {
  return async (dispatch) => {
    try {
      const comments = await commentService.getByPostId(postId)
      dispatch({ type: SET_COMMENTS, comments })
      return comments
    } catch (err) {
      console.error('Cannot load comments:', err)
      throw err
    }
  }
}

// Add a comment to a post
export function addComment(postId, txt) {
  return async (dispatch) => {
    try {
      const savedComment = await commentService.add(postId, txt)
      dispatch({ type: ADD_COMMENT, comment: savedComment })
      return savedComment
    } catch (err) {
      console.error('Cannot add comment:', err)
      throw err
    }
  }
}

// Remove a comment
export function removeComment(commentId) {
  return async (dispatch) => {
    try {
      await commentService.remove(commentId)
      dispatch({ type: REMOVE_COMMENT, commentId })
    } catch (err) {
      console.error('Cannot remove comment:', err)
      throw err
    }
  }
}