import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { logout } from '../store/user.actions'

export function Sidebar() {
  const navClass = ({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`
  const navigate = useNavigate()
  const loggedinUser = useSelector(store => store.userModule.user)

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
      } catch (err) {
        // Logout failed
      }
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Primary">
      <div className="logo">InstaKilo</div>

      <nav>
        <NavLink to="/" className={navClass} end data-tooltip="Home">
          <span className="icon" aria-hidden="true">
            <svg aria-label="Home" height="24" viewBox="0 0 24 24" width="24">
              <title>Home</title>
              <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"></path>
            </svg>
          </span>
          <span className="label">Home</span>
        </NavLink>

        <NavLink to="/search" className={navClass} data-tooltip="Search">
          <span className="icon" aria-hidden="true">
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"></path>
            </svg>
          </span>
          <span className="label">Search</span>
        </NavLink>

        <NavLink to="/explore" className={navClass} data-tooltip="Explore" data-mobile-hidden="true">
          <span className="icon" aria-hidden="true">
            <svg height="24" viewBox="0 0 24 24" width="24">
              <polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
              <polygon fillRule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon>
              <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
            </svg>
          </span>
          <span className="label">Explore</span>
        </NavLink>

        <NavLink to="/reels" className={navClass} data-tooltip="Reels">
          <span className="icon" aria-hidden="true">
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path d="M12.823 1l2.974 5.002h-5.58l-2.65-4.971c.206-.013.419-.022.642-.027L8.55 1Zm2.327 0h.298c3.06 0 4.468.754 5.64 1.887a6.007 6.007 0 0 1 1.596 2.82l.07.295h-4.629L15.15 1Zm-9.667.377L7.95 6.002H1.244a6.01 6.01 0 0 1 3.942-4.53Zm9.735 12.834-4.545-2.624a.909.909 0 0 0-1.356.668l-.008.12v5.248a.91.91 0 0 0 1.255.84l.109-.053 4.545-2.624a.909.909 0 0 0 .1-1.507l-.1-.068-4.545-2.624Zm-14.2-6.209h21.964l.015.36.003.189v6.899c0 3.061-.755 4.469-1.888 5.64-1.151 1.114-2.5 1.856-5.33 1.909l-.334.003H8.551c-3.06 0-4.467-.755-5.64-1.889-1.114-1.15-1.854-2.498-1.908-5.33L1 15.45V8.551l.003-.189Z"></path>
            </svg>
          </span>
          <span className="label">Reels</span>
        </NavLink>

        <NavLink to="/notifications" className={navClass} data-tooltip="Notifications">
          <span className="icon notification-icon" aria-hidden="true">
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
            </svg>
            <span className="notification-badge">2</span>
          </span>
          <span className="label">Notifications</span>
        </NavLink>

        <NavLink to="/create" className={navClass} data-tooltip="Create" data-mobile-hidden="true">
          <span className="icon" aria-hidden="true">
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path d="M12 2.25a.75.75 0 0 1 .75.75v8.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.75 12a.75.75 0 0 1 .75-.75H18a.75.75 0 0 1 0 1.5H7.5a.75.75 0 0 1-.75-.75ZM6.75 18a.75.75 0 0 1 .75-.75H18a.75.75 0 0 1 0 1.5H7.5a.75.75 0 0 1-.75-.75Z"></path>
            </svg>
          </span>
          <span className="label">Create</span>
        </NavLink>

        <NavLink to="/profile" className={navClass} data-tooltip="Profile">
          <span className="icon" aria-hidden="true">
            <svg height="24" viewBox="0 0 24 24" width="24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          </span>
          <span className="label">Profile</span>
        </NavLink>
      </nav>

      <div className="logout" data-mobile-hidden="true">
        {loggedinUser ? (
          <button onClick={handleLogout} className="nav-link" data-tooltip="Logout">
            <span className="icon" aria-hidden="true">
              <svg height="24" viewBox="0 0 24 24" width="24">
                <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
              </svg>
            </span>
            <span className="label">Logout</span>
          </button>
        ) : (
          <NavLink to="/login" className={navClass} data-tooltip="Login">
            <span className="icon" aria-hidden="true">
              <svg height="24" viewBox="0 0 24 24" width="24">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"></path>
              </svg>
            </span>
            <span className="label">Login</span>
          </NavLink>
        )}
      </div>
    </aside>
  )
}