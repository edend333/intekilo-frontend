
const initialState = {
  posts: []
}

export const SET_POSTS = 'SET_POSTS'
export const ADD_POST = 'ADD_POST'
export const UPDATE_POST = 'UPDATE_POST'
export const REMOVE_POST = 'REMOVE_POST'
export const ADD_POST_LIKE = 'ADD_POST_LIKE'
export const REMOVE_POST_LIKE = 'REMOVE_POST_LIKE'

export function postReducer(state = initialState, action) {
    switch (action.type) {
        case SET_POSTS:
            return { ...state, posts: action.posts }

        case ADD_POST:
            return { ...state, posts: [action.post, ...state.posts] }

        case REMOVE_POST:
            console.log('🗑️ REMOVE_POST reducer called with postId:', action.postId)
            console.log('🗑️ Posts before removal:', state.posts.length)
            const filteredPosts = state.posts.filter(p => p._id !== action.postId)
            console.log('🗑️ Posts after removal:', filteredPosts.length)
            console.log('🗑️ Removed post ID:', action.postId)
            return { ...state, posts: filteredPosts }

        case UPDATE_POST:
            return {
                ...state,
                posts: state.posts.map(p =>
                    p._id === action.post._id ? action.post : p
                )
            }

        case ADD_POST_LIKE:
            return {
                ...state,
                posts: state.posts.map(post =>
                    post._id === action.postId
                        ? { ...post, likedBy: [...post.likedBy, action.like] }
                        : post
                )
            }

        case REMOVE_POST_LIKE:
            return {
                ...state,
                posts: state.posts.map(post =>
                    post._id === action.postId
                        ? { ...post, likedBy: post.likedBy.filter(like => like._id !== action.userId) }
                        : post
                )
            }

        default:
            return state
    }
}