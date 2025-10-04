import { legacy_createStore as createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import { userReducer } from './user.reducer'
import { reviewReducer } from './review.reducer'
import { systemReducer } from './system.reducer'
import { postReducer } from './posts/post.reducer'
import { commentReducer } from './comments/comment.reducer'

const rootReducer = combineReducers({
    userModule: userReducer,
    systemModule: systemReducer,
    // reviewModule: reviewReducer,
    postModule: postReducer,
    commentModule: commentReducer,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))

// For debug:
// store.subscribe(() => {
//     console.log('**** Store state changed: ****')
//     console.log('storeState:\n', store.getState())
//     console.log('*******************************')
// })