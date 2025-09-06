import { SET_POSTS, ADD_POST, REMOVE_POST, UPDATE_POST } from './post.reducer'
import { store } from '../store.js'
import { postService } from '../../services/post/post.service.local.js'

export async function loadPosts(params = {}) {
  const { page = 0, limit = 2 } = params
  try {
    const posts = await postService.query({ page, limit })
    store.dispatch({ type: SET_POSTS, posts })   // ← שימוש בקונסטנט
    return posts
  } catch (err) {
    console.error('Cannot load posts', err)
    throw err
  }
}

export async function loadPostById(postId) {
  try {
    const post = await postService.getById(postId)
    store.dispatch({ type: ADD_POST, post })
    return post
  } catch (err) {
    console.error('Cannot load post by id', err)
    throw err
  }
}

export async function addPost(postData) {
  try {
    const savedPost = await postService.save(postData)
    store.dispatch({ type: ADD_POST, post: savedPost })
  } catch (err) {
    console.error('Cannot add post', err)
  }
}

export async function removePost(postId) {
  try {
    await postService.remove(postId)
    store.dispatch({ type: REMOVE_POST, postId })
  } catch (err) {
    console.error('Cannot remove post', err)
  }
}

export async function updatePost(postData) {
  try {
    const updatedPost = await postService.save(postData)
    store.dispatch({ type: UPDATE_POST, post: updatedPost })
  } catch (err) {
    console.error('Cannot update post', err)
  }
}
