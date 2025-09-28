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
import { setUser } from '../store/user.actions'
import TextInputWithEmoji from '../cmps/TextInputWithEmoji'

export function Profile() {
    const { userId } = useParams()
    console.log('🔍 Profile: userId from URL:', userId)
    const loggedinUser = useSelector(store => store.userModule.user)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('posts')
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [posts, setPosts] = useState([])
    const [postsLoading, setPostsLoading] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioText, setBioText] = useState('')
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [showAvatarLightbox, setShowAvatarLightbox] = useState(false)
    const [savedPosts, setSavedPosts] = useState([])
    const [savedPostsLoading, setSavedPostsLoading] = useState(false)
    const [showFollowersModal, setShowFollowersModal] = useState(false)
    const [showFollowingModal, setShowFollowingModal] = useState(false)
    const [editForm, setEditForm] = useState({
        username: '',
        fullname: '',
        imgUrl: '',
        bio: ''
    })


    useEffect(() => {
        // Clear posts when userId changes to prevent showing posts from previous user
        setPosts([])
        setSelectedPost(null)
        setShowModal(false)
        loadUser()
    }, [userId])

    // Listen for avatar updates
    useEffect(() => {
        const handleAvatarUpdate = (event) => {
            const { updatedUser } = event.detail
            if (updatedUser && user && updatedUser._id === user._id) {
                console.log('🔄 Profile: Avatar updated, refreshing user data')
                setUser(updatedUser)
            }
        }

        window.addEventListener('avatarUpdated', handleAvatarUpdate)
        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate)
        }
    }, [user])

    useEffect(() => {
        if (user && loggedinUser) {
            setIsOwnProfile(user._id === loggedinUser._id)
            checkFollowingStatus()
            loadUserPosts()
        } else if (user && !loggedinUser) {
            // User exists but no logged-in user (public profile)
            setIsOwnProfile(false)
            loadUserPosts()
        }
    }, [user, loggedinUser])

    // Listen for changes in saved posts and refresh if needed
    useEffect(() => {
        if (isOwnProfile && activeTab === 'saved') {
            console.log('🔄 Profile: Saved posts changed or tab switched to saved, refreshing...')
            loadSavedPosts()
        }
    }, [loggedinUser?.savedPostIds, isOwnProfile, activeTab])

        const loadUser = async () => {
            try {
                setLoading(true)
            console.log('🔄 Profile: Loading user with ID:', userId)
            
            if (userId === 'me' || !userId) {
                // Load logged-in user's profile
                if (loggedinUser) {
                    setUser(loggedinUser)
                    setIsOwnProfile(true)
                } else {
                    console.log('❌ Profile: No logged-in user found')
                }
            } else {
                // Load specific user's profile with counts
                const userData = await userService.getProfileWithCounts(userId)
                console.log('📊 Profile: Loaded user data with counts:', userData)
                
                if (!userData) {
                    console.error('❌ Profile: User not found with ID:', userId)
                    setUser(null)
                    return
                }
                
                setUser(userData)
            }
        } catch (error) {
            console.error('❌ Profile: Error loading user:', error)
            } finally {
                setLoading(false)
        }
    }

    const loadUserPosts = async () => {
        if (!user || !user._id) {
            console.log('❌ Profile: Cannot load posts - no valid user')
            setPosts([])
            return
        }
        
        try {
            setPostsLoading(true)
            console.log('📸 Profile: Loading posts for user:', user._id)
            console.log('📸 Profile: userId from URL:', userId)
            
            // Verify that we're loading posts for the correct user
            if (userId !== 'me' && userId !== user._id) {
                console.error('❌ Profile: URL userId mismatch!', {
                    urlUserId: userId,
                    userObjectId: user._id
                })
                setPosts([])
                return
            }
            
            const userPosts = await postService.getPostsByOwner(user._id)
            console.log('📊 Profile: Loaded posts count:', userPosts.length)
            console.log('📊 Profile: Posts owner IDs:', userPosts.map(p => p.owner?._id).slice(0, 3))
            console.log('📊 Profile: Expected owner ID:', user._id)
            
            // Validate that all posts belong to the correct user
            const invalidPosts = userPosts.filter(post => post.owner?._id !== user._id)
            if (invalidPosts.length > 0) {
                console.error('❌ Profile: Found posts from other users!', {
                    invalidPosts: invalidPosts.map(p => ({ id: p._id, ownerId: p.owner?._id })),
                    expectedOwnerId: user._id
                })
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
        if (!isOwnProfile && user && loggedinUser) {
            try {
                console.log('👥 Profile: Checking following status for user:', user._id)
                const followingStatus = await userService.isFollowing(user._id)
                setIsFollowing(followingStatus)
                console.log('📊 Profile: Following status:', followingStatus)
            } catch (error) {
                console.error('❌ Profile: Error checking following status:', error)
            }
        }
    }

    const handleTabChange = (tab) => {
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
                dispatch(setUser(updatedUser))
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
        // Reload user data to update follower count
        loadUser()
    }

    const handleFollowingUpdate = () => {
        // Reload user data to update following count
        loadUser()
    }

    const handleFollowToggle = async () => {
        if (!user || !loggedinUser) {
            console.log('❌ Profile: Cannot follow - no user or not logged in')
            return
        }

        console.log('👤 Current logged-in user details:', {
            _id: loggedinUser._id,
            username: loggedinUser.username,
            fullname: loggedinUser.fullname,
            email: loggedinUser.email
        })
        
        console.log('👤 Target user details:', {
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email
        })
        
        console.log('🔄 Follow action:', {
            action: isFollowing ? 'UNFOLLOW' : 'FOLLOW',
            followerId: loggedinUser._id,
            followingId: user._id,
            followerUsername: loggedinUser.username,
            followingUsername: user.username
        })

        try {
            console.log('👥 Profile: Follow toggle called - isFollowing:', isFollowing, 'userId:', user._id)
            
            // Optimistic update for counts
            const currentFollowersCount = user?.followersCount || 0
            const currentFollowingCount = loggedinUser?.followingCount || 0
            
            if (isFollowing) {
                // Optimistic unfollow
                setUser(prev => ({
                    ...prev,
                    followersCount: Math.max(0, currentFollowersCount - 1)
                }))
                
                // Update logged-in user's following count
                if (loggedinUser) {
                    dispatch(setUser({
                        ...loggedinUser,
                        followingCount: Math.max(0, currentFollowingCount - 1)
                    }))
                }
                
                console.log('🔄 Profile: Unfollowing user...')
                await userService.unfollowUser(user._id)
                setIsFollowing(false)
                console.log('✅ Profile: Successfully unfollowed user')
            } else {
                // Optimistic follow
                setUser(prev => ({
                    ...prev,
                    followersCount: currentFollowersCount + 1
                }))
                
                // Update logged-in user's following count
                if (loggedinUser) {
                    dispatch(setUser({
                        ...loggedinUser,
                        followingCount: currentFollowingCount + 1
                    }))
                }
                
                console.log('🔄 Profile: Following user...')
                await userService.followUser(user._id)
                setIsFollowing(true)
                console.log('✅ Profile: Successfully followed user')
            }
        } catch (error) {
            console.error('❌ Profile: Error toggling follow status:', error)
            // Revert optimistic updates on error
            loadUser()
        }
    }

    if (loading) {
        console.log('🔄 Profile: Rendering loading state')
        return <div>Loading...</div>
    }

    if (!user) {
        console.log('❌ Profile: No user found, rendering error')
        return (
            <div className="profile-error">
                <h2>User not found</h2>
                <p>The user you're looking for doesn't exist or has been removed.</p>
            </div>
        )
    }

    console.log('✅ Profile: Rendering profile for user:', user)

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
                                    <button className="btn-settings">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isFollowing ? (
                                        <>
                                            <button className="btn-following" onClick={handleFollowToggle}>
                                                Following
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                                                    <path d="M7 10l5 5 5-5z"/>
                                                </svg>
                                            </button>
                                            <button className="btn-message">Message</button>
                                        </>
                                    ) : (
                                        <button className="btn-follow-blue" onClick={handleFollowToggle}>Follow</button>
                                    )}
                                    <button className="btn-more">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
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
                <button 
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => handleTabChange('saved')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    SAVED
                </button>
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
                            <img src={post.imgUrl} alt="Post" />
                            <div className="post-overlay">
                                <div className="post-stats">
                                            <span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
                
                {activeTab === 'saved' && (
                    <>
                        {!isOwnProfile ? (
                            <div className="saved-content">
                                <EmptyState type="saved" variant="profile" />
                            </div>
                        ) : savedPostsLoading ? (
                            <div className="saved-loading">Loading saved posts...</div>
                        ) : savedPosts.length === 0 ? (
                            <div className="saved-empty-container">
                                <EmptyState type="saved" variant="profile" />
                            </div>
                        ) : (
                            <div className="saved-posts-grid">
                                {savedPosts.map(post => (
                                    <div key={post._id} className="saved-post-item" onClick={() => handlePostClick(post)}>
                                        <img src={post.imgUrl} alt="Saved post" />
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
                onFollowersUpdate={handleFollowersUpdate}
            />

            {/* Following Modal */}
            <FollowingModal
                isOpen={showFollowingModal}
                onClose={() => setShowFollowingModal(false)}
                userId={user?._id}
                isOwnProfile={isOwnProfile}
                onFollowingUpdate={handleFollowingUpdate}
            />
        </div>
    )
}