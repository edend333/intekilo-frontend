# MongoDB Setup Instructions

## Current Issue
The saved posts API is failing because MongoDB is not properly configured or running.

## Solution: Setup MongoDB

### 1. Install MongoDB
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow official installation guide

### 2. Start MongoDB Service
- **Windows**: Start MongoDB service from Services
- **macOS/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`

### 3. Create Environment File
Create `.env` file in `intekilo-server/` directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=intekilo_db
SECRET=Secret-Puk-1234
PORT=3030
NODE_ENV=development
```

### 4. Initialize Database with Sample Data
Run the following commands to populate the database:

```bash
# Navigate to server directory
cd intekilo-server

# Install dependencies
npm install

# Start the server (this will create the database and collections)
npm start
```

### 5. Verify Database Connection
Check MongoDB Compass or command line:
```bash
# Connect to MongoDB
mongosh

# Use the database
use intekilo_db

# Check collections
show collections

# Check users
db.users.find().pretty()

# Check posts
db.posts.find().pretty()
```

### 6. Test Saved Posts API
1. Login to the application
2. Save some posts by clicking the bookmark icon
3. Navigate to profile → Saved tab
4. Check browser console for any errors

## Troubleshooting

### Common Issues:
1. **MongoDB not running**: Start MongoDB service
2. **Connection refused**: Check if MongoDB is listening on port 27017
3. **Authentication failed**: Check MongoDB authentication settings
4. **Database not found**: The database will be created automatically on first use

### Debug Steps:
1. Check MongoDB logs for connection issues
2. Verify environment variables are loaded correctly
3. Test database connection manually
4. Check server console for detailed error messages

## Alternative: Use MongoDB Atlas (Cloud)
If local MongoDB is problematic, you can use MongoDB Atlas:

1. Create free account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=intekilo_db
```

## Expected Behavior After Setup
- ✅ Saved posts API returns 200 status
- ✅ Saved posts are displayed in profile
- ✅ No "Failed to get saved posts" errors
- ✅ Database collections are created automatically
