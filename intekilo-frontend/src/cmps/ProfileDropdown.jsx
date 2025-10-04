import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../store/user.actions'

export function ProfileDropdown({ isOwnProfile = false }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleLogout = async () => {
        try {
            await dispatch(logout())
            navigate('/login')
        } catch (error) {
            console.error('Logout failed:', error)
            // Still navigate even if logout fails
            navigate('/login')
        }
    }

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button 
                className="btn-more" 
                onClick={handleToggleDropdown}
                aria-label="More options"
                aria-expanded={isOpen}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
            </button>
            
            {isOpen && (
                <div className="profile-dropdown">
                    <div className="dropdown-content">
                        {isOwnProfile ? (
                            <>
                                <button className="dropdown-item" onClick={() => setIsOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    הגדרות חשבון
                                </button>
                                <button className="dropdown-item" onClick={() => setIsOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    עזרה ותמיכה
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout-item" onClick={handleLogout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
                                    </svg>
                                    התנתקות
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="dropdown-item" onClick={() => setIsOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    דווח על משתמש
                                </button>
                                <button className="dropdown-item" onClick={() => setIsOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                    חסום משתמש
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
