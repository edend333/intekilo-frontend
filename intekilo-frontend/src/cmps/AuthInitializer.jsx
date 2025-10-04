import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { validateToken, setUser } from '../store/user.actions'
import { userService } from '../services/user'
import { httpService } from '../services/http.service'

const AUTH_INITIALIZED_KEY = 'authInitialized'

export function AuthInitializer({ children }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        // Set up global 401 handler
        const handleGlobal401 = () => {
            console.log('🚨 Global 401 detected - clearing auth and redirecting')
            dispatch(setUser(null))
            localStorage.removeItem('authInitialized')
            sessionStorage.removeItem('authInitialized')
            navigate('/auth')
        }
        
        httpService.setGlobal401Handler(handleGlobal401)
        
        // Always run auth initialization on page load
        const initializeAuth = async () => {
            try {
                // Check if there's a token in localStorage or cookie
                const existingUser = userService.getLoggedinUser()
                const existingToken = userService.getLoginToken()
                
                console.log('🔍 AuthInitializer - existingUser:', existingUser ? 'EXISTS' : 'NOT FOUND')
                console.log('🔍 AuthInitializer - existingToken:', existingToken ? 'EXISTS' : 'NOT FOUND')
                
                // If we have both user and token, proceed with authentication
                if (existingUser && existingToken) {
                    console.log('✅ AuthInitializer - Found existing user and token, proceeding with authentication')
                    
                    // Set authInitialized flag to prevent future issues
                    localStorage.setItem('authInitialized', 'true')
                    sessionStorage.setItem('authInitialized', 'true')
                    
                    // Set user in Redux store immediately
                    dispatch(setUser(existingUser))

                    // Try to validate the token
                    try {
                        const user = await dispatch(validateToken())
                        
                        // If user is authenticated and on login/signup pages, redirect to home
                        if (user && (location.pathname.includes('/login') || location.pathname.includes('/signup'))) {
                            navigate('/')
                        }
                    } catch (err) {
                        console.log('⚠️ Token validation failed:', err.message)
                        
                        // Only clear auth data if it's a real auth error, not a network error
                        if (err.message.includes('auth-required') || err.message.includes('401')) {
                            console.log('🚫 Real auth error - clearing auth data and redirecting to login')
                            dispatch(setUser(null))
                            localStorage.removeItem('authInitialized')
                            sessionStorage.removeItem('authInitialized')
                            
                            // Redirect to auth welcome
                            if (!location.pathname.includes('/auth') && !location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
                                navigate('/auth')
                            }
                        } else {
                            console.log('🌐 Network error - keeping user logged in, will retry later')
                            // For network errors, keep the user logged in and let them continue
                            // The user can still use the app offline or retry when network is back
                        }
                    }
                } else {
                    console.log('❌ AuthInitializer - No existing user or token found')
                    
                    // Clear any stale auth data
                    dispatch(setUser(null))
                    localStorage.removeItem('authInitialized')
                    sessionStorage.removeItem('authInitialized')
                    
                    // If not on auth pages, redirect to auth
                    if (!location.pathname.includes('/auth') && !location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
                        navigate('/auth')
                    }
                }
            } catch (error) {
                console.error('❌ Auth initialization error:', error)
            } finally {
                setIsInitializing(false)
            }
        }

        initializeAuth()
    }, []) // Run only once

    // Show loading skeleton while initializing
    if (isInitializing) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-container">
                    <div className="auth-loading-logo">InstaKilo</div>
                    <div className="auth-loading-spinner"></div>
                </div>
            </div>
        )
    }

    return children
}
