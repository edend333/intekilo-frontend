import { useNavigate } from 'react-router-dom'

export function AuthWelcome() {
    const navigate = useNavigate()

    const handleLogin = () => {
        navigate('/login')
    }

    const handleSignup = () => {
        navigate('/login/signup')
    }

    return (
        <div className="auth-welcome">
            <div className="auth-welcome-container">
                {/* Header */}
                <div className="auth-welcome-header">
                    <div className="auth-welcome-logo">
                        <h1>InstaKilo</h1>
                    </div>
                    <div className="auth-welcome-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>

                {/* Main Content */}
                <div className="auth-welcome-content">
                    <h2 className="auth-welcome-title">
                        כדי לראות את הפיד – התחבר/י או הרשמי/ם
                    </h2>
                    
                    <p className="auth-welcome-subtitle">
                        הצטרף לקהילה שלנו ותתחיל לשתף את הרגעים שלך עם העולם
                    </p>

                    {/* Action Buttons */}
                    <div className="auth-welcome-actions">
                        <button 
                            className="auth-welcome-btn auth-welcome-btn-primary"
                            onClick={handleLogin}
                        >
                            התחברות
                        </button>
                        
                        <button 
                            className="auth-welcome-btn auth-welcome-btn-secondary"
                            onClick={handleSignup}
                        >
                            הרשמה
                        </button>
                    </div>

                    {/* Future SSO */}
                    <div className="auth-welcome-sso">
                        <div className="auth-welcome-divider">
                            <span>או</span>
                        </div>
                        
                        <button 
                            className="auth-welcome-btn auth-welcome-btn-sso"
                            disabled
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            המשך עם Google
                            <span className="auth-welcome-coming-soon">(בקרוב)</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="auth-welcome-footer">
                    <div className="auth-welcome-links">
                        <a href="#" className="auth-welcome-link">תנאי שימוש</a>
                        <span className="auth-welcome-separator">•</span>
                        <a href="#" className="auth-welcome-link">מדיניות פרטיות</a>
                    </div>
                    
                    <p className="auth-welcome-copyright">
                        © 2025 InstaKilo. כל הזכויות שמורות.
                    </p>
                </div>
            </div>
        </div>
    )
}
