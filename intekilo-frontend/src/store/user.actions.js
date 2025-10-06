import { userService } from '../services/user'
import { socketService } from '../services/socket.service'
import { store } from '../store/store'

import { showErrorMsg } from '../services/event-bus.service'
import { LOADING_DONE, LOADING_START } from './system.reducer'
import { REMOVE_USER, SET_USER, SET_USERS, SET_WATCHED_USER, SET_HYDRATION_STATE } from './user.reducer'

export function setUser(user) {
    return {
        type: SET_USER,
        user
    }
}

export function updateUser(user) {
    return {
        type: SET_USER,
        user
    }
}

export function setHydrationState(isHydrated) {
    return {
        type: SET_HYDRATION_STATE,
        isHydrated
    }
}

export async function loadUsers() {
    try {
        store.dispatch({ type: LOADING_START })
        const users = await userService.getUsers()
        store.dispatch({ type: SET_USERS, users })
    } catch (err) {
    } finally {
        store.dispatch({ type: LOADING_DONE })
    }
}

export async function removeUser(userId) {
    try {
        await userService.remove(userId)
        store.dispatch({ type: REMOVE_USER, userId })
    } catch (err) {
    }
}

export function login(credentials) {
    return async (dispatch) => {
        try {
            const user = await userService.login(credentials)
            dispatch({
                type: SET_USER,
                user
            })
            dispatch(setHydrationState(true)) // Mark as hydrated
            socketService.login(user._id)
            return user
        } catch (err) {
            throw err
        }
    }
}

export function signup(credentials) {
    return async (dispatch) => {
        try {
            const user = await userService.signup(credentials)
            dispatch({
                type: SET_USER,
                user
            })
            dispatch(setHydrationState(true)) // Mark as hydrated
            socketService.login(user._id)
            return user
        } catch (err) {
            throw err
        }
    }
}

export function logout() {
    return async (dispatch) => {
        try {
            console.log('🔄 Starting logout process...')
            await userService.logout()
            console.log('✅ Server logout completed')
            
            // Clear user from Redux store
            dispatch({
                type: SET_USER,
                user: null
            })
            dispatch(setHydrationState(true)) // Mark as hydrated
            console.log('✅ Redux state cleared')
            
            // Disconnect socket
            socketService.logout()
            console.log('✅ Socket disconnected')
            console.log('✅ Logout completed - all data cleared')
        } catch (err) {
            console.error('❌ Logout error:', err)
            // Even if logout fails, clear Redux state
            dispatch({
                type: SET_USER,
                user: null
            })
            dispatch(setHydrationState(true)) // Mark as hydrated
            console.log('✅ Redux state cleared despite server error')
            throw err
        }
    }
}

export function validateToken() {
    return async (dispatch) => {
        try {
            const user = await userService.validateToken()
            dispatch({
                type: SET_USER,
                user
            })
            return user
        } catch (err) {
            dispatch({
                type: SET_USER,
                user: null
            })
            throw err
        }
    }
}

// New: Hydration function
export function hydrateAuth() {
    return async (dispatch) => {
        try {
            const user = await userService.getCurrentUser()
            dispatch({
                type: SET_USER,
                user
            })
            dispatch(setHydrationState(true))
            return user
        } catch (err) {
            // User not authenticated
            dispatch({
                type: SET_USER,
                user: null
            })
            dispatch(setHydrationState(true))
            return null
        }
    }
}

export async function loadUser(userId) {
    try {
        const user = await userService.getById(userId)
        store.dispatch({ type: SET_WATCHED_USER, user })
    } catch (err) {
        showErrorMsg('Cannot load user')
    }
}

export async function loadFollowingStats(userId) {
    try {
        const stats = await userService.getFollowingStats(userId)
        return stats
    } catch (err) {
        console.error('Failed to load following stats:', err)
        throw err
    }
}