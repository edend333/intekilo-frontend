import { legacy_createStore as createStore, combineReducers } from 'redux'

import { carReducer } from './car.reducer'
import { userReducer } from './user.reducer'
import { reviewReducer } from './review.reducer'
import { systemReducer } from './system.reducer'
import { postReducer } from './posts/post.reducer'
import { commentReducer } from './comments/comment.reducer'

const rootReducer = combineReducers({
    carModule: carReducer,
    userModule: userReducer,
    systemModule: systemReducer,
    // reviewModule: reviewReducer,
    postModule: postReducer,
    commentModule: commentReducer,

})


const middleware = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__() : undefined
export const store = createStore(rootReducer, middleware)

// For debug:
// store.subscribe(() => {
//     console.log('**** Store state changed: ****')
//     console.log('storeState:\n', store.getState())
//     console.log('*******************************')
// })



