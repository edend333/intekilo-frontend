import { NavLink } from 'react-router-dom'

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">InstaKilo</div>
            <nav>
                <NavLink to="/" className="nav-link">
                    <span className="icon">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="m21.762 8.786-7-6.68a3.994 3.994 0 0 0-5.524 0l-7 6.681A4.017 4.017 0 0 0 1 11.68V19c0 2.206 1.794 4 4 4h3.005a1 1 0 0 0 1-1v-7.003a2.997 2.997 0 0 1 5.994 0V22a1 1 0 0 0 1 1H19c2.206 0 4-1.794 4-4v-7.32a4.02 4.02 0 0 0-1.238-2.894Z"></path></svg>
                    </span>
                    <span className="label">Home</span>
                </NavLink>

                <NavLink to="/search" className="nav-link">
                    <span className="icon">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M10 2a8 8 0 0 1 6.32 12.906l5.387 5.387-1.414 1.414-5.387-5.387A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"></path></svg>
                    </span>
                    <span className="label">Search</span>
                </NavLink>

                <NavLink to="/explore" className="nav-link">
                    <span className="icon">
                        <svg aria-label="Explore" class="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Explore</title><polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon><polygon fill-rule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon><circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle></svg>
                    </span>
                    <span className="label">Explore</span>
                </NavLink>

                <NavLink to="/create" className="nav-link">
                    <span className="icon">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="label">Create</span>
                </NavLink>

                <NavLink to="/profile" className="nav-link">
                    <span className="icon">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                    </span>
                    <span className="label">Profile</span>
                </NavLink>
            </nav>

            <div className="bottom-nav">
                <NavLink to="/logout" className="nav-link">
                    <span className="icon">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path></svg>
                    </span>
                    <span className="label">Logout</span>
                </NavLink>
            </div>
        </aside>
    )
}
