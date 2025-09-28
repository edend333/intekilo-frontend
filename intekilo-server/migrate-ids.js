import { MongoClient, ObjectId } from 'mongodb'
import config from './config/index.js'

async function migrateIds() {
    const client = new MongoClient(config.dbURL)
    
    try {
        await client.connect()
        console.log('✅ Connected to MongoDB')
        
        const db = client.db(config.dbName)
        
        // Migrate posts collection
        console.log('🔄 Migrating posts collection...')
        const postsCollection = db.collection('posts')
        const posts = await postsCollection.find({}).toArray()
        
        for (const post of posts) {
            const updates = {}
            
            // Convert _id if it's a string
            if (typeof post._id === 'string' && !post._id.match(/^[0-9a-fA-F]{24}$/)) {
                console.log(`📝 Converting post _id: ${post._id}`)
                // We can't change _id directly, so we'll add a new field
                updates.oldId = post._id
            }
            
            // Convert owner._id if it's a string
            if (post.owner && typeof post.owner._id === 'string' && !post.owner._id.match(/^[0-9a-fA-F]{24}$/)) {
                console.log(`📝 Converting post owner._id: ${post.owner._id}`)
                updates['owner._id'] = post.owner._id
            }
            
            // Update if there are changes
            if (Object.keys(updates).length > 0) {
                await postsCollection.updateOne(
                    { _id: post._id },
                    { $set: updates }
                )
            }
        }
        
        // Migrate comments collection
        console.log('🔄 Migrating comments collection...')
        const commentsCollection = db.collection('comments')
        const comments = await commentsCollection.find({}).toArray()
        
        for (const comment of comments) {
            const updates = {}
            
            // Convert _id if it's a string
            if (typeof comment._id === 'string' && !comment._id.match(/^[0-9a-fA-F]{24}$/)) {
                console.log(`📝 Converting comment _id: ${comment._id}`)
                updates.oldId = comment._id
            }
            
            // Convert postId if it's a string
            if (typeof comment.postId === 'string' && !comment.postId.match(/^[0-9a-fA-F]{24}$/)) {
                console.log(`📝 Converting comment postId: ${comment.postId}`)
                updates.postId = comment.postId
            }
            
            // Convert by._id if it's a string
            if (comment.by && typeof comment.by._id === 'string' && !comment.by._id.match(/^[0-9a-fA-F]{24}$/)) {
                console.log(`📝 Converting comment by._id: ${comment.by._id}`)
                updates['by._id'] = comment.by._id
            }
            
            // Update if there are changes
            if (Object.keys(updates).length > 0) {
                await commentsCollection.updateOne(
                    { _id: comment._id },
                    { $set: updates }
                )
            }
        }
        
        console.log('✅ Migration completed successfully')
        
    } catch (error) {
        console.error('❌ Migration failed:', error)
    } finally {
        await client.close()
        console.log('🔌 Disconnected from MongoDB')
    }
}

// Run migration
migrateIds()
