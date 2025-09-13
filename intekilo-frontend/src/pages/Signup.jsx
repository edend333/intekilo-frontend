import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { signup } from '../store/user.actions'

export function Signup() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    fullname: '',
    username: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  function handleChange(ev) {
    const { name, value } = ev.target
    setCredentials(prev => ({ ...prev, [name]: value }))
    setError('') // Clear error when user types
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await dispatch(signup(credentials))
      navigate('/')
    } catch (err) {
      console.error('Signup failed:', err)
      setError(err.message || 'שגיאה בהרשמה')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Main Signup Card */}
        <div className="signup-card">
          <div className="logo">
            <h1>InstaKilo</h1>
          </div>
          
          <p className="signup-subtitle">
            הירשמו כדי לראות תמונות וסרטונים מחברים שלכם.
          </p>

          <div className="divider">
            <span>או</span>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="מספר טלפון או כתובת מייל"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              name="password"
              placeholder="סיסמה"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="fullname"
              placeholder="שם מלא"
              value={credentials.fullname}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              name="username"
              placeholder="שם משתמש"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            {error && (
              <div className="error-message" style={{ color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <p className="terms-info">
              על ידי הרשמה, אתם מסכימים ל<a href="#">תנאים</a>, <a href="#">מדיניות פרטיות</a> ו<a href="#">מדיניות קוקיז</a> שלנו.
            </p>

            <button type="submit" className="signup-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'נרשמים...' : 'הירשמו'}
            </button>
          </form>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <p>
            יש לכם חשבון? <Link to="/login">התחברו</Link>
          </p>
        </div>
      </div>
    </div>
  )
}