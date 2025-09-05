import { NavLink } from 'react-router-dom'

export function Sidebar() {
  const navClass = ({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`

  return (
    <aside className="sidebar" role="navigation" aria-label="Primary">
      <div className="logo">InstaKilo</div>

      <nav>
        <NavLink to="/" className={navClass} end data-tooltip="Home">
          <span className="icon" aria-hidden="true">
            <svg aria-label="Home" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <title>Home</title>
              <path d="m21.762 8.786-7-6.68C13.266.68 10.734.68 9.238 2.106l-7 6.681A4.017 4.017 0 0 0 1 11.68V20c0 1.654 1.346 3 3 3h5.005a1 1 0 0 0 1-1L10 15c0-1.103.897-2 2-2 1.09 0 1.98.877 2 1.962L13.999 22a1 1 0 0 0 1 1H20c1.654 0 3-1.346 3-3v-8.32a4.021 4.021 0 0 0-1.238-2.894ZM21 20a1 1 0 0 1-1 1h-4.001L16 15c0-2.206-1.794-4-4-4s-4 1.794-4 4l.005 6H4a1 1 0 0 1-1-1v-8.32c0-.543.226-1.07.62-1.447l7-6.68c.747-.714 2.013-.714 2.76 0l7 6.68c.394.376.62.904.62 1.448V20Z"></path>
            </svg>
          </span>
          <span className="label">Home</span>
        </NavLink>

        <NavLink to="/search" className={navClass} data-tooltip="Search">
          <span className="icon" aria-hidden="true">
            <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <path d="M10 2a8 8 0 0 1 6.32 12.906l5.387 5.387-1.414 1.414-5.387-5.387A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"></path>
            </svg>
          </span>
          <span className="label">Search</span>
        </NavLink>

        <NavLink to="/explore" className={navClass} data-tooltip="Explore">
          <span className="icon" aria-hidden="true">
            <svg aria-label="Explore" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <title>Explore</title>
              <polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
              <polygon fillRule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon>
              <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
            </svg>
          </span>
          <span className="label">Explore</span>
        </NavLink>

        <NavLink to="/reels" className={navClass} data-tooltip="Reels">
          <span className="icon" aria-hidden="true">
            <svg aria-label="Reels" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <title>Reels</title>
              <path d="M12.823 1l2.974 5.002h-5.58l-2.65-4.971c.206-.013.419-.022.642-.027L8.55 1Zm2.327 0h.298c3.06 0 4.468.754 5.64 1.887a6.007 6.007 0 0 1 1.596 2.82l.07.295h-4.629L15.15 1Zm-9.667.377L7.95 6.002H1.244a6.01 6.01 0 0 1 3.942-4.53Zm9.735 12.834-4.545-2.624a.909.909 0 0 0-1.356.668l-.008.12v5.248a.91.91 0 0 0 1.255.84l.109-.053 4.545-2.624a.909.909 0 0 0 .1-1.507l-.1-.068-4.545-2.624Zm-14.2-6.209h21.964l.015.36.003.189v6.899c0 3.061-.755 4.469-1.888 5.64-1.151 1.114-2.5 1.856-5.33 1.909l-.334.003H8.551c-3.06 0-4.467-.755-5.64-1.889-1.114-1.15-1.854-2.498-1.908-5.33L1 15.45V8.551l.003-.189Z"></path>
            </svg>
          </span>
          <span className="label">Reels</span>
        </NavLink>

        <NavLink to="/notifications" className={navClass} data-tooltip="Notifications">
          <span className="icon" aria-hidden="true">
            <svg aria-label="Notifications" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <title>Notifications</title>
              <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
            </svg>
          </span>
          <span className="label">Notifications</span>
        </NavLink>

        <NavLink to="/create" className={navClass} data-tooltip="Create">
          <span className="icon" aria-hidden="true">
            <svg aria-label="New post" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <title>New post</title>
              <path d="M21 11h-8V3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 1 0 2 0v-8h8a1 1 0 1 0 0-2Z"></path>
            </svg>
          </span>
          <span className="label">Create</span>
        </NavLink>

        <NavLink to="/profile" className={navClass} data-tooltip="Profile">
          <span className="icon" aria-hidden="true">
            <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          </span>
          <span className="label">Profile</span>
        </NavLink>
      </nav>

      <div className="logout">
        <NavLink to="/logout" className={navClass} data-tooltip="Logout">
          <span className="icon" aria-hidden="true">
            <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
              <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
            </svg>
          </span>
          <span className="label">Logout</span>
        </NavLink>
      </div>
    </aside>
  )
}
