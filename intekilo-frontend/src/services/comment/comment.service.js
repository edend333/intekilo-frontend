import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'
import { userService } from '../user'
import { comments } from './comments.js' 

const STORAGE_KEY = 'comment'

_initComments()

function _initComments() {
  const initialComments = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (!initialComments || !initialComments.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
  }
}

export const commentService = {
  query,
  getByPostId,
  add,
  remove,
}

async function query() {
  return await storageService.query(STORAGE_KEY)
}

async function getByPostId(postId) {
  const comments = await storageService.query(STORAGE_KEY)
  return comments.filter(comment => comment.postId === postId)
}

async function add(postId, txt) {
  const comment = {
    id: makeId(),
    postId,
    txt,
    by: userService.getLoggedinUser(),
    createdAt: Date.now(),
  }

  const savedComment = await storageService.post(STORAGE_KEY, comment)
  return savedComment
}

async function remove(commentId) {
  await storageService.remove(STORAGE_KEY, commentId)
}
