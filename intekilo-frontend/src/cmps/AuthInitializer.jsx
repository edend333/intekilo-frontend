import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { validateToken } from '../store/user.actions'
import { userService } from '../services/user'

const AUTH_INITIALIZED_KEY = 'authInitialized'

export function AuthInitializer({ children }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Check if auth was already initialized in this session
        const hasInitialized = sessionStorage.getItem(AUTH_INITIALIZED_KEY)
        if (hasInitialized) return
        
        const initializeAuth = async () => {
            // Mark as initialized
            sessionStorage.setItem(AUTH_INITIALIZED_KEY, 'true')
            
            // Check if there's a token in sessionStorage or cookie
            const existingUser = userService.getLoggedinUser()
            
            if (!existingUser) {
                // No token anywhere, redirect to login if not already there
                if (!location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
                    navigate('/login')
                }
                return
            }

            // If we have user data, try to validate the token
            // But don't redirect to login if validation fails - keep the user logged in with cached data
            try {
                const user = await dispatch(validateToken())
                
                // If user is authenticated and on login/signup pages, redirect to home
                if (user && (location.pathname.includes('/login') || location.pathname.includes('/signup'))) {
                    navigate('/')
                }
                // If validation failed but we have cached user data, let them continue
                // The token will be validated again when they make actual requests
            } catch (err) {
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
