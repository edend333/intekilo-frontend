import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { userService } from './services/user'
import { HomePage } from './pages/HomePage'
import { ChatApp } from './pages/Chat.jsx'
import { AdminIndex } from './pages/AdminIndex.jsx'
import { postService } from './services/post/post.service.local'
import { commentService } from './services/comment/comment.service.js'
import { UserDetails } from './pages/UserDetails'
import { UserMsg } from './cmps/UserMsg.jsx'
import { LoginSignup } from './pages/LoginSignup.jsx'
import { Login } from './pages/Login.jsx'
import { Signup } from './pages/Signup.jsx'
import { Sidebar } from './cmps/Sidebar.jsx'
import { loadAllComments } from './store/comments/comment.actions.js'
import { ModalPost } from './pages/ModalPost.jsx'


export function RootCmp() {

    useEffect(() => {
        loadAllComments()
    }, [])
    return (
        <div className="main-container">
            <Sidebar />
            {/* <UserMsg /> */}

            <main>
                <Routes>
                    <Route path="/" element={<HomePage />}>
                        <Route path="post/:postId" element={<ModalPost />} />
                    </Route>

                    <Route path="user/:id" element={<UserDetails />} />
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
                </Routes>
            </main>
        </div>
    )
}




function AuthGuard({ children, checkAdmin = false }) {
    const user = userService.getLoggedinUser()
    const isNotAllowed = !user || (checkAdmin && !user.isAdmin)
    if (isNotAllowed) {
        console.log('Not Authenticated!')
        return <Navigate to="/" />
    }
    return children
}
