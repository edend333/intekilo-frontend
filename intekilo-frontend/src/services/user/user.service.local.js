import { storageService } from '../async-storage.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

export const userService = {
    login,
    logout,
    signup,
    getUsers,
    getById,
    remove,
    update,
    updateBio,
    getLoggedinUser,
}

function getUsers() {
    return storageService.query('user')
}

async function getById(userId) {
    return await storageService.get('user', userId)
}

function remove(userId) {
    return storageService.remove('user', userId)
}

async function update({ _id }) {
    const user = await storageService.get('user', _id)
    await storageService.put('user', user)

	// When admin updates other user's details, do not update loggedinUser
    const loggedinUser = getLoggedinUser()
    if (loggedinUser._id === user._id) _saveLocalUser(user)

    return user
}

async function updateBio(userId, bio) {
    const user = await storageService.get('user', userId)
    user.bio = bio
    await storageService.put('user', user)
    
    // Update loggedinUser if it's the same user
    const loggedinUser = getLoggedinUser()
    if (loggedinUser && loggedinUser._id === userId) {
        _saveLocalUser(user)
    }
    
    return user
}

async function login(userCred) {
    const users = await storageService.query('user')
 const user = users.find(user =>
  user.username === userCred.username && user.password === userCred.password
)

    if (user) return _saveLocalUser(user)
}

async function signup(userCred) {
    if (!userCred.imgUrl) userCred.imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'

    const user = await storageService.post('user', userCred)
    return _saveLocalUser(user)
}

async function logout() {
    // Clear localStorage FIRST (this is where the token is stored via async-storage)
    localStorage.removeItem('loggedinUser')
    localStorage.removeItem('loginToken')
    localStorage.removeItem('user')
    localStorage.removeItem('review')
    localStorage.removeItem('comment')
    localStorage.removeItem('authInitialized')
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('accessToken')
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
    sessionStorage.removeItem('loginToken')
    sessionStorage.removeItem('authInitialized')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('accessToken')
    sessionStorage.clear()
    
    // Clear cookies
    document.cookie = 'loggedinUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=None; secure=false'
    document.cookie = 'loginToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=None; secure=false'
    document.cookie = 'authInitialized=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=None; secure=false'
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=None; secure=false'
    document.cookie = 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=None; secure=false'
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; sameSite=None; secure=false'
    
    document.cookie = 'loggedinUser=; Path=/; Max-Age=0; sameSite=None; secure=false'
    document.cookie = 'loginToken=; Path=/; Max-Age=0; sameSite=None; secure=false'
    document.cookie = 'loggedinUser=; Path=/; Max-Age=-1; sameSite=None; secure=false'
    document.cookie = 'loginToken=; Path=/; Max-Age=-1; sameSite=None; secure=false'
    
    document.cookie = 'loggedinUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; secure=false'
    document.cookie = 'loginToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; secure=false'
    document.cookie = 'loggedinUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; secure=false'
    document.cookie = 'loginToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; secure=false'
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}

function _saveLocalUser(user) {
    user = { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl, isAdmin : user.isAdmin }
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
}

// To quickly create an admin user, uncomment the next line
// _createAdmin()
async function _createAdmin() {
    const user = {
        username: 'admin',
        password: 'admin',
        fullname: 'Mustafa Adminsky',
        imgUrl: 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png',
    }

    const newUser = await storageService.post('user', user)
}