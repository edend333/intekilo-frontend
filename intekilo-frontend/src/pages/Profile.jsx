import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { userService } from '../services/user'
import { postService } from '../services/post/post.service'
import { CommentsModal } from '../cmps/CommentsModal.jsx'
import { ImgUploader } from '../cmps/ImgUploader.jsx'
import { EmptyState } from '../cmps/EmptyState.jsx'
import { AvatarLightbox } from '../cmps/AvatarLightbox.jsx'
import { FollowersModal } from '../cmps/FollowersModal.jsx'
import { FollowingModal } from '../cmps/FollowingModal.jsx'
import { ProfileDropdown } from '../cmps/ProfileDropdown.jsx'
import { setUser as setLoggedInUser } from '../store/user.actions'
import TextInputWithEmoji from '../cmps/TextInputWithEmoji'



export function Profile() {
    const { userId } = useParams()
    const loggedinUser = useSelector(store => store.userModule.user)
    const dispatch = useDispatch()
    
    // 📦 תרחל כל ה-State לפני כל שימוש
    const [activeTab, setActiveTab] = useState('posts')
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [posts, setPosts] = useState([])
    const [postsLoading, setPostsLoading] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [optimisticFollowState, setOptimisticFollowState] = useState(null) // null, true, false
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioText, setBioText] = useState('')
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [showAvatarLightbox, setShowAvatarLightbox] = useState(false)
    const [savedPosts, setSavedPosts] = useState([])
    const [savedPostsLoading, setSavedPostsLoading] = useState(false)
    const [showFollowersModal, setShowFollowersModal] = useState(false)
    const [showFollowingModal, setShowFollowingModal] = useState(false)
    const [isUpdatingFollowing, setIsUpdatingFollowing] = useState(false)
    // Removed skipNextUserReload - was causing blocking on new profile loads
    
    // 🛡️ editForm יתראה בריק ויתעדכן רק אחרי טעינת user
    const [editForm, setEditForm] = useState({
        username: '',
        fullname: '',
        imgUrl: '',
        bio: ''
    })
    
    // 🎯 Target IDs - מזהה המשתמשים בעקביות
    const targetUserId = user?._id  // מזהה המשתמש מהפרופיל (כלומר הקבוע שעל הטעון פרופיל שלו)
    const loggedinUserId = loggedinUser?._id  // מזהה המשתמש המחובר (מגיע מה-Redux)
    

    // 🎯 Single source of truth: Always execute this when entering/changing profile
    useEffect(() => {
        
        // Clear previous state
        setPosts([])
        setSelectedPost(null)
        setShowModal(false)
        setIsFollowing(false)  // Reset following status - will be fetched from server
        setOptimisticFollowState(null)  // Clear any optimistic state
        setIsUpdatingFollowing(false)  // CRITICAL: Reset updating flag to prevent blocking
        
        if (!userId) {
            return
        }
        
        // Always load user data regardless of navigation source
        const initializeProfile = async () => {
            try {
                await loadUser()
            } catch (error) {
                console.error('❌ DEBUG: Error initializing profile:', error)
            }
        }
        
        initializeProfile()
    }, [userId, loggedinUser?._id])

    // Listen for avatar updates
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { updatedUser } = event.detail
            if (updatedUser && user && updatedUser._id === user._id) {
                setUser(updatedUser)
            }
        }

        window.addEventListener('avatarUpdated', handleAvatarUpdate)
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate)
        }
    }, [user])

    // 🔄 Handle profile loading based on user state (after user is loaded)
    useEffect(() => {
        if (user && loggedinUser) {
            setIsOwnProfile(user._id === loggedinUser._id)
            loadUserPosts()
            
            // Add checkFollowingStatus for external profiles 
            if (user._id !== loggedinUser._id) {
                checkFollowingStatus()
            }
        } else if (user && !loggedinUser) {
            // User exists but no logged-in user (public profile)
            setIsOwnProfile(false)
            loadUserPosts()
        }
    }, [user, loggedinUser])

    // 🎯 CRITICAL FIX: Check following status whenever userId changes (for modal navigation)
    useEffect(() => {
        // Only check following status if:
        // 1. We have a valid userId from URL
        // 2. We have loaded user data
        // 3. We have a logged-in user
        // 4. It's not the same user (not own profile)
        if (userId && user && loggedinUser && user._id !== loggedinUser._id) {
            // Reset optimistic state when changing profiles
            setOptimisticFollowState(null)
            setIsUpdatingFollowing(false)
            
            checkFollowingStatus()
        }
    }, [userId, user?._id, loggedinUser?._id]) // Depend on userId and user IDs, not full objects

    // Listen for changes in saved posts and refresh if needed (ONLY for own profile)
    useEffect(() => {
        if (isOwnProfile && activeTab === 'saved') {
            loadSavedPosts()
        } else if (!isOwnProfile && activeTab === 'saved') {
            // If somehow we're on saved tab for external profile, redirect to posts
            setActiveTab('posts')
        }
    }, [loggedinUser?.savedPostIds, isOwnProfile, activeTab])

    const loadUser = async () => {
        // Remove skipNextUserReload protection - always load fresh data when needed
        // Only skip if we're in the middle of a follow/unfollow operation
        if (isUpdatingFollowing) {
            return
        }
        
        try {
            setLoading(true)
            
            if (userId === 'me' || !userId) {
                // Load logged-in user's profile from Redux (source of truth)
                if (loggedinUser) {
                    setUser(loggedinUser)
                    setIsOwnProfile(true)
                } else {
                    // No logged-in user found
                    navigate('/login')
                    return
                }
            } else {
                // Load specific user's profile with counts
                const userData = await userService.getProfileWithCounts(userId)
                
                if (!userData) {
                    setUser(null)
                    return
                }
                
                setUser(userData)
                
                // 🛡️ עדכון editForm אחרי טעינת user
                setEditForm({
                    username: userData.username || '',
                    fullname: userData.fullname || '',
                    imgUrl: userData.imgUrl || '',
                    bio: userData.bio || ''
                })
            }
        } catch (error) {
            console.error('❌ Profile: Error loading user:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadUserPosts = async () => {
        if (!user || !user._id) {
            setPosts([])
            return
        }
        
        try {
            setPostsLoading(true)
            
            // 📝 Always load posts for the user object (source of truth)
            const userPosts = await postService.getPostsByOwner(user._id)
            
            // Validate that all posts belong to the correct user
            const invalidPosts = userPosts.filter(post => post.owner?._id !== user._id)
            if (invalidPosts.length > 0) {
                // Filter out invalid posts
                const validPosts = userPosts.filter(post => post.owner?._id === user._id)
                setPosts(validPosts)
            } else {
                setPosts(userPosts)
            }
        } catch (error) {
            console.error('❌ Profile: Error loading posts:', error)
            setPosts([])
        } finally {
            setPostsLoading(false)
        }
    }

    const checkFollowingStatus = async () => {
        // Check if we have all required data and it's not own profile
        if (user && loggedinUser && targetUserId && user._id !== loggedinUser._id) {
            try {
                // 🎯 Get accurate status from server instead of local state
                const actualStatus = await userService.isFollowing(targetUserId)
                setIsFollowing(actualStatus)
            } catch (error) {
                // Fallback to Redux/local state
                const followingArr = Array.isArray(loggedinUser?.following) ? loggedinUser.following : []
                const userFollowingStatus = followingArr.includes(targetUserId)
                setIsFollowing(userFollowingStatus)
            }
        }
    }

    const handleTabChange = (tab) => {
        // Block saved tab access for external profiles
        if (tab === 'saved' && !isOwnProfile) {
            return // Don't allow tab switch
        }
        
        setActiveTab(tab)
        if (tab === 'saved' && isOwnProfile) {
            loadSavedPosts()
        }
    }

    const loadSavedPosts = async () => {
        if (!isOwnProfile) return
        
        setSavedPostsLoading(true)
        try {
            const saved = await userService.getSavedPosts()
            setSavedPosts(saved)
        } catch (error) {
            console.error('Error loading saved posts:', error)
        } finally {
            setSavedPostsLoading(false)
        }
    }

    const handlePostClick = (post) => {
        setSelectedPost(post)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedPost(null)
    }

    const handleEditBio = () => {
        setIsEditingBio(true)
    }

    const handleSaveBio = async () => {
        try {
            const updatedUser = await userService.updateBio(user._id, bioText)
            setUser(updatedUser)
            setIsEditingBio(false)
        } catch (error) {
            console.error('Error updating bio:', error)
        }
    }

    const handleCancelBio = () => {
        setBioText(user.bio || '')
        setIsEditingBio(false)
    }

    const handleEditProfile = () => {
        setIsEditingProfile(true)
    }

    const handleSaveProfile = async () => {
        try {
            const userToUpdate = { ...user, ...editForm }
            const updatedUser = await userService.update(userToUpdate)
            setUser(updatedUser)
            
            // Update Redux store if this is the logged-in user's profile
            if (isOwnProfile) {
                dispatch(setLoggedInUser(updatedUser))
            }
            
            setIsEditingProfile(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    const handleCancelProfile = () => {
        setEditForm({
            username: user.username || '',
            fullname: user.fullname || '',
            imgUrl: user.imgUrl || '',
            bio: user.bio || ''
        })
        setIsEditingProfile(false)
    }

    const handleFormChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleFollowersClick = () => {
        setShowFollowersModal(true)
    }

    const handleFollowingClick = () => {
        setShowFollowingModal(true)
    }

    const handleFollowersUpdate = () => {
        // Profile component manages its own state - no external intervention needed
        // The follow/unfollow action already updates the state correctly
    }

    const handleFollowingUpdate = () => {
        // Profile component manages its own state - no external intervention needed
        // The follow/unfollow action already updates the state correctly
    }

    const handleFollowToggle = async () => {
        // ✅ 1. Guard - בדיקת תנאים מקדימה
        if (!loggedinUser || !user || isFollowLoading) {
            return
        }

        // ✅ 2.Set loading: setIsFollowLoading(true)
        setIsFollowLoading(true)
        
        // 🛡️ Mark that we're updating following status to prevent useEffect interference
        setIsUpdatingFollowing(true)
        
        // ✅ 3. Snapshot (ל-rollback)
        const originalIsFollowing = isFollowing
        const originalFollowersCount = user.followersCount || 0
        const originalFollowingArr = loggedinUser.following || []
        const originalFollowingCount = loggedinUser.followingCount || 0

        try {
            // Set loading state for optimistic UI
            setIsFollowLoading(true)
            
            if (isFollowing) {
                // Optimistic UI: Show "Follow" immediately for unfollow action
                setOptimisticFollowState(false)  // ✅ Use optimistic state for immediate UI update
                
                // 🔽 Optimistic update for counts
                setUser(prev => ({
                    ...prev,
                    followersCount: Math.max(0, (prev.followersCount || 0) - 1)
                }))
                
                // 🔽 Update logged-in user's following array and count
                const updatedFollowing = originalFollowingArr.filter(id => id !== targetUserId)
                // Prepare action for later dispatch - dispatch called after API
                
                // Debug: Log what we're about to dispatch
                const actionToDispatch = setLoggedInUser({
                    ...loggedinUser,
                    following: updatedFollowing,
                    followingCount: Math.max(0, (loggedinUser.followingCount || 0) - 1)
                })
                
                const response = await userService.unfollowUser(targetUserId)
                
                // ✅ Now dispatch after successful API
                dispatch(actionToDispatch)
                
                // ✅ Always re-check status from server to ensure UI sync
                await checkFollowingStatus()
                setOptimisticFollowState(null)  // Clear optimistic state, use server state
                
                // No longer blocking user reloads - let fresh data load when needed
            } else {
                // Optimistic UI: Immediate state update for better UX
                setOptimisticFollowState(true)  // ✅ Use optimistic state for immediate UI update
                
                // 🔥 Optimistic update for counts  
                setUser(prev => ({
                    ...prev,
                    followersCount: (prev.followersCount || 0) + 1
                }))
                
                // 🔥 Update logged-in user's following array...
                const updatedFollowing = [...originalFollowingArr, targetUserId]
                // Prepare action for later dispatch
                const actionToDispatch = setLoggedInUser({
                    ...loggedinUser,
                    following: updatedFollowing,
                    followingCount: (loggedinUser.followingCount || 0) + 1
                })
                
                const response = await userService.followUser(targetUserId)
                
                // ✅ Now dispatch after successful API
                dispatch(actionToDispatch)
                
                // ✅ Always re-check status from server to ensure UI sync
                await checkFollowingStatus()
                setOptimisticFollowState(null)  // Clear optimistic state, use server state
                
                // No longer blocking user reloads - let fresh data load when needed
            }

        } catch (error) {
            // ✅ 5. Catch (Rollback)
            console.error('❌ Profile: Error toggling follow status:', error)
            
            // Rollback UI state
            setIsFollowing(originalIsFollowing)
            setOptimisticFollowState(null)  // Clear optimistic state on error
            setUser(prev => ({ ...prev, followersCount: originalFollowersCount }))
            
            // Rollback Redux state
            dispatch(setLoggedInUser({
                ...loggedinUser,
                following: originalFollowingArr,
                followingCount: originalFollowingCount
            }))
            
            // Friendly error toast
            alert(`Failed to ${!originalIsFollowing ? 'follow' : 'unfollow'} user: ${error.response?.data?.err || error.message}`)
        } finally {
            // ✅ 6. Finally: setIsFollowLoading(false)
            setIsFollowLoading(false)
            
            // 🛡️ Reset the update flag
            setIsUpdatingFollowing(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return (
            <div className="profile-error">
                <h2>User not found</h2>
                <p>The user you're looking for doesn't exist or has been removed.</p>
            </div>
        )
    }

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-picture-section">
                    <div 
                        className="profile-picture"
                        onClick={() => setShowAvatarLightbox(true)}
                        title="צפייה בתמונה"
                    >
                        <img src={user.imgUrl || 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'} alt={user.username || user.fullname || 'משתמש'} />
                    </div>
                </div>

                <div className="profile-info">
                    <div className="profile-username-section">
                        <h1 className="profile-username">{user.username}</h1>
                        <div className="profile-actions">
                            {isOwnProfile ? (
                                <>
                                    <button className="btn-edit" onClick={handleEditProfile}>
                                        Edit Profile
                                    </button>
                                    <ProfileDropdown isOwnProfile={true} />
                                </>
                            ) : (
                                <>
                                    {(() => {
                                        // 🎯 Display optimistic state if available, otherwise server state
                                        const displayFollowing = optimisticFollowState !== null ? optimisticFollowState : isFollowing
                                        console.log('🚨 DEBUG: Button render - isFollowing:', isFollowing, 'optimisticFollowState:', optimisticFollowState, 'displayFollowing:', displayFollowing, 'isOwnProfile:', isOwnProfile, 'targetUserId:', targetUserId)
                                        return displayFollowing ? (
                                        <>
                                            <button 
                                                className="btn-following" 
                                                onClick={handleFollowToggle}
                                                disabled={isFollowLoading}
                                                title={isFollowLoading ? "Processing..." : "Click to unfollow (hover)"}
                                            >
                                                {isFollowLoading ? "Following…" : "Following"}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                                                    <path d="M7 10l5 5 5-5z"/>
                                                </svg>
                                            </button>
                                            <button className="btn-message">Message</button>
                                        </>
                                    ) : (
                                        <button 
                                            className="btn-follow-blue" 
                                            onClick={handleFollowToggle}
                                            disabled={isFollowLoading}
                                        >
                                            {isFollowLoading ? "Following…" : "Follow"}
                                        </button>
                                        )
                                    })()}
                                    <ProfileDropdown isOwnProfile={false} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-number">{user?.postsCount || 0}</span>
                            <span className="stat-label">פוסטים</span>
                        </div>
                        <div className="stat clickable-stat" onClick={handleFollowersClick}>
                            <span className="stat-number">{user?.followersCount || 0}</span>
                            <span className="stat-label">עוקבים</span>
                        </div>
                        <div className="stat clickable-stat" onClick={handleFollowingClick}>
                            <span className="stat-number">{user?.followingCount || 0}</span>
                            <span className="stat-label">עוקב אחרי</span>
                        </div>
                    </div>

                    {!isOwnProfile && user.mutualFollowers && user.mutualFollowers.length > 0 && (
                        <div className="followed-by-info">
                            <p className="followed-by-text">
                                Followed by {user.mutualFollowers.slice(0, 2).map((follower, index) => (
                                    <span key={follower._id} className="followed-by-user">
                                        {follower.username}
                                        {index < Math.min(user.mutualFollowers.length, 2) - 1 && ', '}
                                    </span>
                                ))}
                                {user.mutualFollowers.length > 2 && ` + ${user.mutualFollowers.length - 2} more`}
                            </p>
                        </div>
                    )}

                    <div className="profile-bio">
                        {isEditingBio ? (
                            <div className="bio-edit">
                                <TextInputWithEmoji
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    placeholder="Write your bio..."
                                    rows={3}
                                    emojiPosition="bottom-right"
                                    className="bio-textarea"
                                />
                                <div className="bio-actions">
                                    <button onClick={handleSaveBio}>Save</button>
                                    <button onClick={handleCancelBio}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="bio-display">
                                <p>{user.bio || 'No bio available'}</p>
                                {isOwnProfile && (
                                    <button className="edit-bio-btn" onClick={handleEditBio}>
                                        Edit Bio
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Tabs */}
            <div className="profile-tabs">
                <button 
                    className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => handleTabChange('posts')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    </svg>
                    POSTS
                </button>
                {/* Only show SAVED tab for own profile */}
                {isOwnProfile && (
                <button 
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => handleTabChange('saved')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    SAVED
                </button>
                )}
                <button 
                    className={`tab ${activeTab === 'tagged' ? 'active' : ''}`}
                    onClick={() => handleTabChange('tagged')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    TAGGED
                </button>
            </div>

            {/* Profile Content */}
            <div className="profile-content">
                {activeTab === 'posts' && (
                    <>
                        {postsLoading ? (
                            <div className="posts-loading">Loading posts...</div>
                        ) : posts.length === 0 ? (
                            <div className="posts-empty-container">
                                <EmptyState type="posts" variant="profile" user={user} />
                            </div>
                        ) : (
                            <div className="posts-grid">
                                {posts.map(post => (
                                <div key={post._id} className="post-thumbnail" onClick={() => handlePostClick(post)}>
                                    {/* Conditionally render image vs video */}
                                    {post.type === 'video' ? (
                                        <video 
                                            src={post.videoUrl} 
                                            poster={post.posterUrl || post.imgUrl} 
                                            preload="none"
                                            muted
                                            className="post-media"
                                            alt={`Video by ${post.owner?.fullname || 'User'}`}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img 
                                            src={post.imgUrl} 
                                            alt={`Post by ${post.owner?.fullname || 'User'}`} 
                                            className="post-media"
                                            loading="lazy"
                                        />
                                    )}
                                    
                                    {/* Video play overlay indicator */}
                                    {post.type === 'video' && (
                                        <div className="video-play-overlay">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                    )}
                                    
                            <div className="post-overlay">
                                <div className="post-stats">
                                            <span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                                {post.likedBy?.length || 0}
                                            </span>
                                            <span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                                {post.msgs?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'saved' && isOwnProfile && (
                    <>
                        {savedPostsLoading ? (
                            <div className="saved-loading">Loading saved posts...</div>
                        ) : savedPosts.length === 0 ? (
                            <div className="saved-empty-container">
                                <EmptyState type="saved" variant="profile" />
                            </div>
                        ) : (
                            <div className="saved-posts-grid">
                                {savedPosts.map(post => (
                                    <div key={post._id} className="saved-post-item" onClick={() => handlePostClick(post)}>
                                        {/* Conditionally render image vs video */}
                                        {post.type === 'video' ? (
                                            <video 
                                                src={post.videoUrl} 
                                                poster={post.posterUrl || post.imgUrl} 
                                                preload="none"
                                                muted
                                                className="post-media"
                                                alt={`Video by ${post.owner?.fullname || 'User'}`}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <img 
                                                src={post.imgUrl} 
                                                alt={`Saved post by ${post.owner?.fullname || 'User'}`} 
                                                className="post-media"
                                                loading="lazy"
                                            />
                                        )}
                                        
                                        {/* Video play overlay indicator for saved posts */}
                                        {post.type === 'video' && (
                                            <div className="video-play-overlay">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
                
                {activeTab === 'tagged' && (
                    <div className="tagged-content">
                        <p>Tagged posts will appear here</p>
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="modal-overlay" onClick={handleCancelProfile}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Profile</h2>
                            <button className="close-btn" onClick={handleCancelProfile}>✖</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <ImgUploader onUploaded={(imgUrl) => handleFormChange('imgUrl', imgUrl)} />
                                {editForm.imgUrl && (
                                    <img src={editForm.imgUrl} alt="Preview" className="preview-img" />
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => handleFormChange('username', e.target.value)}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.fullname}
                                    onChange={(e) => handleFormChange('fullname', e.target.value)}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Bio</label>
                                <TextInputWithEmoji
                                    value={editForm.bio}
                                    onChange={(e) => handleFormChange('bio', e.target.value)}
                                    placeholder="Write your bio..."
                                    rows={3}
                                    emojiPosition="bottom-right"
                                    className="edit-form-bio"
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button onClick={handleCancelProfile}>Cancel</button>
                            <button onClick={handleSaveProfile}>Save Changes</button>
                        </div>
                    </div>
            </div>
            )}

            {/* Comments Modal */}
            {showModal && selectedPost && (
            <CommentsModal 
                postId={selectedPost?._id}
                post={selectedPost}
                isOpen={showModal}
                onClose={handleCloseModal}
            />
            )}

            {/* Avatar Lightbox */}
            <AvatarLightbox
                isOpen={showAvatarLightbox}
                onClose={() => setShowAvatarLightbox(false)}
                user={user}
                isOwnProfile={isOwnProfile}
            />

            {/* Followers Modal */}
            <FollowersModal
                isOpen={showFollowersModal}
                onClose={() => setShowFollowersModal(false)}
                userId={user?._id}
                isOwnProfile={isOwnProfile}
                currentUserId={loggedinUser?._id}
                onFollowersUpdate={handleFollowersUpdate}
            />

            {/* Following Modal */}
            <FollowingModal
                isOpen={showFollowingModal}
                onClose={() => setShowFollowingModal(false)}
                userId={user?._id}
                isOwnProfile={isOwnProfile}
                currentUserId={loggedinUser?._id}
                onFollowingUpdate={handleFollowingUpdate}
            />
        </div>
    )
}