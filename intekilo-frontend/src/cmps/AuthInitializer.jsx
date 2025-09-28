import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { validateToken, setUser } from '../store/user.actions'
import { userService } from '../services/user'

const AUTH_INITIALIZED_KEY = 'authInitialized'

export function AuthInitializer({ children }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Always run auth initialization on page load
        const initializeAuth = async () => {
            // Check if there's a token in localStorage or cookie
            const existingUser = userService.getLoggedinUser()
            const existingToken = userService.getLoginToken()
            
            console.log('🔍 AuthInitializer - existingUser:', existingUser ? 'EXISTS' : 'NOT FOUND')
            console.log('🔍 AuthInitializer - existingToken:', existingToken ? 'EXISTS' : 'NOT FOUND')
            
            // Only proceed if we have BOTH user and token
            if (!existingUser || !existingToken) {
                console.log('❌ AuthInitializer - Missing user or token, redirecting to login')
                // No user or token, redirect to login if not already there
                if (!location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
                    navigate('/login')
                }
                return
            }

            console.log('✅ AuthInitializer - Both user and token found, proceeding with auth')
            // Set the existing user in Redux store immediately
            dispatch(setUser(existingUser))

            // If we have user data, try to validate the token
            try {
                const user = await dispatch(validateToken())
                
                // If user is authenticated and on login/signup pages, redirect to home
                if (user && (location.pathname.includes('/login') || location.pathname.includes('/signup'))) {
                    navigate('/')
                }
            } catch (err) {
                console.log('⚠️ Token validation failed, but keeping user logged in with cached data')
                // Token validation failed, but keep user logged in with cached data
                // If on login/signup pages, redirect to home since we have cached data
                if (location.pathname.includes('/login') || location.pathname.includes('/signup')) {
                    navigate('/')
                }
            }
        }

        initializeAuth()
    }, []) // Run only once

    return children
}
