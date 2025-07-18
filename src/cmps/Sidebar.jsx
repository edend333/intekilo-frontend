import { NavLink } from 'react-router-dom'

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1>InstaKilo</h1>
            </div>

            <nav className="nav-links">
                <NavLink to="/" className="nav-link">
                    <svg aria-label="Home" fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
                        <path d="M21.762 8.786 14.762 2.106a3.994 3.994 0 0 0-5.524 0L2.238 8.787A4.017 4.017 0 0 0 1 11.68V19a4 4 0 0 0 4 4h3a1 1 0 0 0 1-1v-7a3 3 0 0 1 6 0v7a1 1 0 0 0 1 1h3a4 4 0 0 0 4-4v-7.32a4.02 4.02 0 0 0-1.238-2.894Z"></path>
                    </svg>
                    <span>Home</span>
                </NavLink>

                <NavLink to="/search" className="nav-link">
                    <svg aria-label="Search" fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
                        <path d="M10.5 3a7.5 7.5 0 0 1 6.041 11.934l4.262 4.263-1.414 1.414-4.263-4.262A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"></path>
                    </svg>
                    <span>Search</span>
                </NavLink>

                <NavLink to="/explore" className="nav-link">
                    <svg aria-label="Explore" fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
                        <path d="M13.501 2.002a2.518 2.518 0 0 0-.272.014 1.02 1.02 0 0 0-.105.014h-.002l-.002.001a9.999 9.999 0 1 0 9.86 8.546 1.03 1.03 0 0 0 .02-.217A10.001 10.001 0 0 0 13.501 2Zm3.241 6.26-1.94 5.824a1 1 0 0 1-.622.63l-5.818 1.946 1.94-5.823a1 1 0 0 1 .621-.63l5.82-1.946Z"></path>
                    </svg>
                    <span>Explore</span>
                </NavLink>

                <NavLink to="/create" className="nav-link">
                    <svg aria-label="New post" fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
                        <path d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1Z"></path>
                    </svg>
                    <span>Create</span>
                </NavLink>

                <NavLink to="/profile" className="nav-link">
                    <svg aria-label="Profile" fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
                        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.5 0-6 2.5-6 5.5V21h12v-1.5c0-3-2.5-5.5-6-5.5Z"></path>
                    </svg>
                    <span>Profile</span>
                </NavLink>
            </nav>

            <div className="logout-section">
                <NavLink to="/logout" className="nav-link">
                    <svg aria-label="Logout" fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
                        <path d="M16 13v-2H7V8l-5 4 5 4v-3h9Zm3-9H5c-1.1 0-2 .9-2 2v4h2V6h14v12H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Z"></path>
                    </svg>
                    <span>Logout</span>
                </NavLink>
            </div>
        </aside>
    )
}
