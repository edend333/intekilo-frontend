# MongoDB Debug Instructions

## Quick MongoDB Setup

### 1. **Install MongoDB (if not installed)**
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

### 2. **Start MongoDB**
```bash
# Windows: Start MongoDB service from Services
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### 3. **Verify MongoDB is Running**
```bash
mongosh --eval "db.runCommand('ping')"
# Should return: { ok: 1 }
```

### 4. **Connect to Database**
```bash
mongosh
use intekilo_db
```

### 5. **Check Collections**
```javascript
// In MongoDB shell
show collections
// Should show: users, posts, comments, etc.
```

### 6. **Check User Data**
```javascript
// In MongoDB shell
db.users.findOne(
  { username: "edend333" },
  { savedPostIds: 1, username: 1, _id: 1 }
)
```

### 7. **Check Posts Data**
```javascript
// In MongoDB shell
db.posts.find({}, { _id: 1, txt: 1, owner: 1 }).limit(5)
```

## Environment Variables

Create `.env` file in `intekilo-server/`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=intekilo_db
SECRET=Secret-Puk-1234
PORT=3030
NODE_ENV=development
```

## Test Database Connection

### **Test 1: Basic Connection**
```javascript
// In MongoDB shell
db.runCommand('ping')
```

### **Test 2: Check Database**
```javascript
// In MongoDB shell
db.getName()
// Should return: intekilo_db
```

### **Test 3: Check Users**
```javascript
// In MongoDB shell
db.users.countDocuments()
// Should return number > 0
```

### **Test 4: Check Posts**
```javascript
// In MongoDB shell
db.posts.countDocuments()
// Should return number > 0
```

## Common Issues

### **Issue 1: MongoDB Not Running**
**Error**: `MongoServerError: connect ECONNREFUSED`
**Solution**: Start MongoDB service

### **Issue 2: Wrong Database Name**
**Error**: Database not found
**Solution**: Check `DB_NAME` in .env file

### **Issue 3: Connection String Wrong**
**Error**: Invalid connection string
**Solution**: Check `MONGO_URL` in .env file

### **Issue 4: No Data**
**Error**: Collections empty
**Solution**: Import sample data or create test data

## Sample Data Creation

### **Create Test User**
```javascript
// In MongoDB shell
db.users.insertOne({
  _id: ObjectId("68d798431b6c7c620f8e4730"),
  username: "edend333",
  email: "eden@test.com",
  fullname: "Eden Test",
  savedPostIds: ["68d7c19c113b369b4144a803"],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### **Create Test Post**
```javascript
// In MongoDB shell
db.posts.insertOne({
  _id: ObjectId("68d7c19c113b369b4144a803"),
  txt: "Test post content",
  owner: {
    _id: ObjectId("68d798431b6c7c620f8e4730"),
    username: "edend333",
    imgUrl: "https://example.com/avatar.jpg"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Verification

After setup, test the API:
```bash
curl -X GET "http://localhost:3030/api/users/me/saved-posts" \
  -H "Cookie: loginToken=YOUR_TOKEN" \
  -v
```

Should return 200 OK with saved posts array.
