import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { hydrateAuth, setUser, setHydrationState } from '../store/user.actions'
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
            dispatch(setHydrationState(true)) // Mark as hydrated
            localStorage.removeItem('authInitialized')
            sessionStorage.removeItem('authInitialized')
            navigate('/auth')
        }
        
        httpService.setGlobal401Handler(handleGlobal401)
        
        // Hydrate authentication state
        const initializeAuth = async () => {
            try {
                console.log('🔄 Starting auth hydration...')
                await dispatch(hydrateAuth())
                console.log('✅ Auth hydration completed')
            } catch (error) {
                console.error('❌ Auth hydration error:', error)
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

// Ensure the component is properly exported
export default AuthInitializer
