import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const posts = JSON.parse(readFileSync(join(__dirname, '../data/posts.json.js'), 'utf8'))

const mongoUrl = process.env.MONGO_URL
const dbName = process.env.DB_NAME

async function loadPostsToMongoDB() {
    try {
        console.log('🔄 Connecting to MongoDB...')
        const client = await MongoClient.connect(mongoUrl)
        const db = client.db('Intekilo') // Use exact case from MongoDB
        
        console.log('📊 Connected to database:', dbName)
        
        // Clear existing posts
        await db.collection('posts').deleteMany({})
        console.log('🗑️ Cleared existing posts')
        
        // Insert new posts
        const result = await db.collection('posts').insertMany(posts)
        console.log(`✅ Inserted ${result.insertedCount} posts`)
        
        // Verify the data
        const count = await db.collection('posts').countDocuments()
        console.log(`📈 Total posts in database: ${count}`)
        
        await client.close()
        console.log('🔒 Connection closed')
        
    } catch (error) {
        console.error('❌ Error loading posts:', error)
        process.exit(1)
    }
}

loadPostsToMongoDB()
