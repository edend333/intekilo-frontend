import { PostList } from "../cmps/posts/PostList"
import { RightSidebar } from "../cmps/RightSidebar"
import { Outlet } from "react-router-dom"
export function HomePage() {
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
