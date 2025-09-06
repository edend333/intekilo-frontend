import { Outlet } from 'react-router'
import { NavLink } from 'react-router-dom'

export function LoginSignup() {
    return (
        <div className="login-page">

            <Outlet />
        </div>
    )
}