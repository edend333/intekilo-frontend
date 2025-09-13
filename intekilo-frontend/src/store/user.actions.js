import { userService } from '../services/user'
import { socketService } from '../services/socket.service'
import { store } from '../store/store'

import { showErrorMsg } from '../services/event-bus.service'
import { LOADING_DONE, LOADING_START } from './system.reducer'
import { REMOVE_USER, SET_USER, SET_USERS, SET_WATCHED_USER } from './user.reducer'

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
            socketService.login(user)
            return user
        } catch (err) {
            throw err
        }
    }
}

export function logout() {
    return async (dispatch) => {
        try {
            await userService.logout()
            dispatch({
                type: SET_USER,
                user: null
            })
            socketService.logout()
        } catch (err) {
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

export async function loadUser(userId) {
    try {
        const user = await userService.getById(userId)
        store.dispatch({ type: SET_WATCHED_USER, user })
    } catch (err) {
        showErrorMsg('Cannot load user')
    }
}