import { useSelector } from 'react-redux'
import { useEffect } from "react";

export function PostPreview({ post,onOpenPost  }) {


    const comments = useSelector(store => store.commentModule.comments)
    const commentCount = comments.filter(comment => comment.postId === post._id).length

    // useEffect(() => {
    //     console.log('commentCount:', comments)
    //     console.log('postID:', post._id)
    // }, [comments])

    return (
        <article className="post-preview">
            <header className="post-header">
                <img className="user-img" src={post.by.imgUrl} alt="User" />
                <span className="username">{post.by.fullname}</span>
                <span className="dot-menu">•••</span>
            </header>

            <img className="post-img" src={post.imgUrl} alt="Post" />

            <section className="post-actions">
                <div className="left-icons">
                    <svg aria-label="Like" class="x1lliihq x1n2onr6 xyb1xck" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>

                    <svg aria-label="Comment" class="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment</title><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path></svg>
                    <svg aria-label="Share" class="x1lliihq x1n2onr6 xyb1xck" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Share</title><path d="M13.973 20.046 21.77 6.928C22.8 5.195 21.55 3 19.535 3H4.466C2.138 3 .984 5.825 2.646 7.456l4.842 4.752 1.723 7.121c.548 2.266 3.571 2.721 4.762.717Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7.488" x2="15.515" y1="12.208" y2="7.641"></line></svg>
                </div>

                <div className="right-icon">
                    <svg aria-label="Save" class="x1lliihq x1n2onr6 xyb1xck" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Save</title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></svg>
                </div>
            </section>
            {/*  */}

            <section className="post-meta">
                {post.likedBy.length > 0 && (
                    <p>{post.likedBy.length} likes</p>
                )}                {commentCount > 0 && (
                    <p className="view-comments" onClick={onOpenPost} >View all {commentCount} comments</p>
                )}
            </section>
            {/*  */}

            <section className="post-details">
                <p><span className="username">{post.by.fullname}</span> {post.txt}</p>
            </section>

            <section className="comment-input">
                <input type="text" placeholder="Add a comment..." />
            </section>
        </article>
    )
}
