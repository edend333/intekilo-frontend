import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Post } from './models/post.model.js'

dotenv.config()

async function testPosts() {
    try {
        console.log('🔄 Connecting to MongoDB...')
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: process.env.DB_NAME
        })
        
        console.log('📊 Connected to database:', process.env.DB_NAME)
        
        // Test the Post model
        const posts = await Post.find({})
        console.log(`📈 Found ${posts.length} posts`)
        
        if (posts.length > 0) {
            console.log('📝 First post:', JSON.stringify(posts[0], null, 2))
        }
        
        await mongoose.disconnect()
        console.log('🔒 Disconnected from MongoDB')
        
    } catch (error) {
        console.error('❌ Error:', error)
    }
}

testPosts()

