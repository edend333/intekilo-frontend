import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'
import { userService } from '../user'
import { posts } from './posts.js'

const STORAGE_KEY = 'post'
_initPosts()

function _initPosts() {
  let postsFromStorage = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (!postsFromStorage || !postsFromStorage.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }
}

export const postService = {
  query,
  getById,
  save,
  remove,
}
window.ps = postService

async function query({ txt = '', page = 0, limit = 10 } = {}) {
  let posts = await storageService.query(STORAGE_KEY)
  console.log('📦 all posts from storage:', posts)
  console.log('🔍 txt:', txt, '📄 page:', page, '📏 limit:', limit)

  if (txt) {
    const regex = new RegExp(txt, 'i')
    posts = posts.filter(post => regex.test(post.txt) || regex.test(post.by.fullname))
    console.log('🎯 filtered posts:', posts)
  }

  const startIdx = page * limit
  const endIdx = startIdx + limit
  const sliced = posts.slice(startIdx, endIdx)
  console.log('📚 posts for page:', sliced)
  return sliced
}



function getById(postId) {
  return storageService.get(STORAGE_KEY, postId)
}

async function remove(postId) {
  await storageService.remove(STORAGE_KEY, postId)
}

async function save(post) {
  let savedPost
  if (post._id) {
    const postToSave = {
      ...post,
      txt: post.txt,
      imgUrl: post.imgUrl,
    }
    savedPost = await storageService.put(STORAGE_KEY, postToSave)
  } else {
    const postToSave = {
      _id: makeId(),
      txt: post.txt,
      imgUrl: post.imgUrl,
      by: userService.getLoggedinUser(),
      likedBy: [],
      loc: post.loc || null,
      tags: post.tags || [],
      createdAt: Date.now(),
    }
    savedPost = await storageService.post(STORAGE_KEY, postToSave)
  }
  return savedPost
}
