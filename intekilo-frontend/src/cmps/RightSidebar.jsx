// src/cmps/RightSidebar.jsx
export function RightSidebar() {
    return (
        <aside className="right-sidebar">
            <div className="user-info">
                <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="User" />
                <div className="user-details">
                    <span className="username">your_username</span>
                    <span className="fullname">Your Full Name</span>
                </div>
                <button className="switch-btn">Switch</button>
            </div>

            <div className="suggested">
                <h4>Suggested for you</h4>
                <ul className="suggested-list">
                    <li className="suggested-user">
                        <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="User 1" />
                        <div className="user-details">
                            <span className="username">user1</span>
                            <span className="mutual">Followed by ...</span>
                        </div>
                        <button className="follow-btn">Follow</button>
                    </li>
                </ul>
            </div>

            <div className="footer-links">
                <p>About · Help · Press · API · Jobs · Privacy · Terms</p>
                <p>© 2025 InstaKilo FROM E.D</p>
            </div>
        </aside>
    )
}
