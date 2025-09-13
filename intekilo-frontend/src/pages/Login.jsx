import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { login } from '../store/user.actions'

export function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
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
      await dispatch(login(credentials))
      navigate('/')
    } catch (err) {
      setError('כתובת מייל או סיסמה שגויים')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-box">
        <h1 className="logoLogin">InstaKilo</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="כתובת מייל"
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
          
          {error && (
            <div className="error-message" style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-login" 
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'מתחבר...' : 'התחבר/י'}
          </button>
        </form>

        <div className="divider">או</div>

        <a className="forgot-password" href="#">שכחת את הסיסמה?</a>

        <div className="signup-prompt">
          אין לך חשבון? <a href="/signup">הרשמה</a>
        </div>

        <footer className="login-footer">
          עברית · הסכמי פשרה · Meta Verified · Instagram from Meta · Threads · תנאים · פרטיות · קוקיז · עוד
        </footer>
      </div>

      <div className="image-section">
        <img src="public/img/loginImg.png" alt="loginImg" />
      </div>
    </section>
  )
}