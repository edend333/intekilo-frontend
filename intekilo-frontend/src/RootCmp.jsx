import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { userService } from './services/user'
import { HomePage } from './pages/HomePage'
import { ChatApp } from './pages/Chat.jsx'
import { AdminIndex } from './pages/AdminIndex.jsx'
import { commentService } from './services/comment/comment.service.js'
import { UserDetails } from './pages/UserDetails'
import { UserMsg } from './cmps/UserMsg.jsx'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { Login } from './pages/Login.jsx'
import { Signup } from './pages/Signup.jsx'
import { Sidebar } from './cmps/Sidebar.jsx'
import { ModalPost } from './pages/ModalPost.jsx'
import { Profile } from './pages/Profile.jsx'
import { AuthInitializer } from './cmps/AuthInitializer.jsx'


export function RootCmp() {
    return (
        <AuthInitializer>
            <div className="main-container">
                <Sidebar />
                {/* <UserMsg /> */}

                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />}>
                            <Route path="post/:postId" element={<ModalPost />} />
                        </Route>

                        <Route path="user/:id" element={<UserDetails />} />
                        <Route path="profile" element={
                            <AuthGuard>
                                <Profile />
                            </AuthGuard>
                        } />
                        <Route path="chat" element={<ChatApp />} />
                        <Route path="admin" element={
                            <AuthGuard checkAdmin={true}>
                                <AdminIndex />
                            </AuthGuard>
                        } />
                        <Route path="login" element={<LoginSignup />}>
                            <Route index element={<Login />} />
                            <Route path="signup" element={<Signup />} />
                        </Route>
                        <Route path="signup" element={<Signup />} />
                    </Routes>
                </main>
            </div>
        </AuthInitializer>
    )
}




function AuthGuard({ children, checkAdmin = false }) {
    const user = userService.getLoggedinUser()
    const isNotAllowed = !user || (checkAdmin && !user.isAdmin)
    if (isNotAllowed) {
        return <Navigate to="/login" />
    }
    return children
}
