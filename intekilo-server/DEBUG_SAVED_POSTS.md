# Debug Saved Posts API - 400 Error

## Current Issue
`GET /api/users/me/saved-posts` returns 400 Bad Request with `{ err: "Failed to get saved posts" }`

## Debug Steps

### 1. **Check Authentication**
Look for these logs in server console:
```
🔍 setupAls - Request URL: /api/users/me/saved-posts
🔍 Found loginToken cookie, validating...
✅ Valid token, setting loggedinUser: [userId]
🔐 requireAuth middleware called for: GET /api/users/me/saved-posts
✅ requireAuth - User authenticated: [userId]
```

### 2. **Check Controller**
Look for these logs:
```
🔍 getSavedPosts: Authenticated user: { userId: "...", username: "...", offset: 0, limit: 20 }
```

### 3. **Check Service**
Look for these logs:
```
🔍 getSavedPosts called with: { userId: "...", offset: 0, limit: 20 }
🔍 User criteria: { _id: ObjectId("...") }
🔄 dbService.getCollection called for: users
✅ Database connected successfully
✅ Collection obtained: users
🔍 Found user: { _id: "...", username: "..." }
```

### 4. **Check Database Connection**
Verify MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Connect to database
mongosh
use intekilo_db
db.users.findOne({}, { savedPostIds: 1 })
```

### 5. **Check User Data**
Verify user has savedPostIds:
```javascript
// In MongoDB shell
db.users.findOne(
  { _id: ObjectId("USER_ID_HERE") },
  { savedPostIds: 1, username: 1 }
)
```

## Common Issues & Solutions

### **Issue 1: Authentication Failed**
**Symptoms**: No `loggedinUser` in controller
**Solution**: Check loginToken cookie, verify token validation

### **Issue 2: Database Connection Failed**
**Symptoms**: `dbService.getCollection error`
**Solution**: Start MongoDB, check connection string

### **Issue 3: User Not Found**
**Symptoms**: `Found user: NOT FOUND`
**Solution**: Check user ID format, verify user exists in DB

### **Issue 4: Invalid savedPostIds**
**Symptoms**: Error in ObjectId conversion
**Solution**: Check for mixed ID formats, use cleanup function

## Manual Testing

### **Test 1: Direct API Call**
```bash
curl -X GET "http://localhost:3030/api/users/me/saved-posts?offset=0&limit=20" \
  -H "Cookie: loginToken=YOUR_TOKEN_HERE" \
  -v
```

### **Test 2: Check User Data**
```javascript
// In MongoDB shell
db.users.find(
  { username: "edend333" },
  { savedPostIds: 1, username: 1, _id: 1 }
)
```

### **Test 3: Check Posts Collection**
```javascript
// In MongoDB shell
db.posts.find({}, { _id: 1, txt: 1 }).limit(5)
```

## Expected Log Flow

```
1. 🔍 setupAls - Request URL: /api/users/me/saved-posts
2. 🔍 Found loginToken cookie, validating...
3. ✅ Valid token, setting loggedinUser: 68d798431b6c7c620f8e4730
4. 🔐 requireAuth middleware called for: GET /api/users/me/saved-posts
5. ✅ requireAuth - User authenticated: 68d798431b6c7c620f8e4730
6. 🔍 getSavedPosts: Authenticated user: { userId: "68d798431b6c7c620f8e4730", username: "edend333", offset: 0, limit: 20 }
7. 🔍 getSavedPosts called with: { userId: "68d798431b6c7c620f8e4730", offset: 0, limit: 20 }
8. 🔍 User criteria: { _id: ObjectId("68d798431b6c7c620f8e4730") }
9. 🔄 dbService.getCollection called for: users
10. ✅ Database connected successfully
11. ✅ Collection obtained: users
12. 🔍 Found user: { _id: "68d798431b6c7c620f8e4730", username: "edend333" }
13. 🔍 Saved post IDs: ["68d7c19c113b369b4144a803"]
14. 🔍 Valid Object IDs for query: 1 out of 1
15. 🔍 Found saved posts: 1
16. ✅ getSavedPosts: Successfully retrieved 1 saved posts
```

## If Still Failing

### **Check Server Logs**
Look for any error messages in the server console

### **Check Network Tab**
Verify the request is being sent with correct headers and cookies

### **Check Database**
Ensure MongoDB is running and accessible

### **Check Environment**
Verify all environment variables are set correctly
