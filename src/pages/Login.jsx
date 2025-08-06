import { useState } from 'react'

export function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })

  function handleChange(ev) {
    const { name, value } = ev.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    console.log('Logging in with:', credentials)
    // פה אפשר להוסיף התחברות בפועל בעתיד
  }

  return (
    <section className="login-page">
      <div className="login-box">
        <h1 className="logoLogin">InstaKilo</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="מספר טלפון, שם משתמש או אימייל"
            value={credentials.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            value={credentials.password}
            onChange={handleChange}
          />
          <button className="btn-login">התחבר/י</button>
        </form>

        <div className="divider">או</div>

        {/* <button className="facebook-login">התחבר/י באמצעות פייסבוק</button> */}
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
