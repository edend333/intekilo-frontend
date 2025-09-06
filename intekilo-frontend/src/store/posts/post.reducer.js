
export const SET_POSTS = 'SET_POSTS'
export const ADD_POST = 'ADD_POST'
export const REMOVE_POST = 'REMOVE_POST'
export const UPDATE_POST = 'UPDATE_POST'

const initialState = {
    posts: []
}

export function postReducer(state = initialState, action) {
    switch (action.type) {
        case SET_POSTS:
            return { ...state, posts: action.posts }

        case ADD_POST:
            return { ...state, posts: [...state.posts, action.post] }

        case REMOVE_POST:
            return { ...state, posts: state.posts.filter(p => p._id !== action.postId) }

        case UPDATE_POST:
            return {
                ...state,
                posts: state.posts.map(p =>
                    p._id === action.post._id ? action.post : p
                )
            }

        default:
            return state
    }
}