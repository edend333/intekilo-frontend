import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { loadUser } from '../store/user.actions'
import { store } from '../store/store'
import { showSuccessMsg } from '../services/event-bus.service'
import { socketService, SOCKET_EVENT_USER_UPDATED, SOCKET_EMIT_USER_WATCH } from '../services/socket.service'

export function UserDetails() {

    const params = useParams()
    const user = useSelector(storeState => storeState.userModule.watchedUser)

    useEffect(() => {
        loadUser(params.id)

        socketService.emit(SOCKET_EMIT_USER_WATCH, params.id)
        socketService.on(SOCKET_EVENT_USER_UPDATED, onUserUpdate)

        return () => {
            socketService.off(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
        }

    }, [params.id])

    // Listen for avatar updates to refresh user data
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { updatedUser } = event.detail
            if (updatedUser && user && updatedUser._id === user._id) {
                console.log('🔄 UserDetails: Avatar updated for current user, refreshing user data')
                // Update the user data
                store.dispatch({ type: 'SET_WATCHED_USER', user: updatedUser })
            }
        }

        window.addEventListener('avatarUpdated', handleAvatarUpdate)
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate)
        }
    }, [user?._id])

    function onUserUpdate(user) {
        showSuccessMsg(`This user ${user.username || user.fullname} just got updated from socket`)
        store.dispatch({ type: 'SET_WATCHED_USER', user })
    }

    return (
        <main className="user-details">
            <h1>User Details</h1>
            {user && <div>
                <h3>
                    {user.username || user.fullname || 'משתמש'}
                </h3>
                <img src={user.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} style={{ width: '100px' }} />
                <pre> {JSON.stringify(user, null, 4)} </pre>
            </div>}
        </main>
    )
}