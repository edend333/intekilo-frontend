import { PostList } from "../cmps/posts/PostList"
import { RightSidebar } from "../cmps/RightSidebar"
import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

export function HomePage() {
  // Get authentication state from Redux
  const isAuthenticated = useSelector(state => state.userModule?.isAuthenticated)
  const isHydrated = useSelector(state => state.userModule?.isHydrated)

  // Guard: Don't render feed content until hydrated
  if (!isHydrated) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
      </div>
    )
  }

  // Guard: Don't render feed content if not authenticated
  if (!isAuthenticated) {
    return null // This should not happen due to AuthGuard, but safety check
  }

  return (
    <section className="home-page">
      <div className="feed-wrapper">
        <div className="feed-layout">
          <main className="feed">
            <PostList />
          </main>
          <aside className="suggestions">
            <RightSidebar />
          </aside>
        </div>
      </div>
      <Outlet />
    </section>
  )
}
