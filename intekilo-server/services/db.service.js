import { MongoClient } from 'mongodb'
import config from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = { getCollection, createIndexes }

var dbConn = null

// Default configuration if environment variables are not set
const defaultConfig = {
    dbURL: 'mongodb://localhost:27017',
    dbName: 'intekilo_db'
}


async function getCollection(collectionName) {
    try { 
        console.log('🔄 dbService.getCollection called for:', collectionName)
        
        const dbConfig = {
            dbURL: config.dbURL || defaultConfig.dbURL,
            dbName: config.dbName || defaultConfig.dbName
        }
        
        console.log('🔍 Config:', dbConfig)
        
        const db = await _connect(dbConfig)
        console.log('✅ Database connected successfully')
        
        const collection = await db.collection(collectionName)
        console.log('✅ Collection obtained:', collectionName)
        return collection
    } catch (err) {
        console.log('❌ dbService.getCollection error:', err)
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}


async function _connect(dbConfig) {
    if (dbConn) {
        console.log('♻️ Using existing database connection')
        return dbConn
    }

    try {
        console.log('🔄 Connecting to MongoDB...')
        console.log('🔍 Connection URL:', dbConfig.dbURL)
        console.log('🔍 Database Name:', dbConfig.dbName)
        
        const client = await MongoClient.connect(dbConfig.dbURL)
        dbConn = client.db(dbConfig.dbName)
        console.log('✅ MongoDB connected successfully')
        
        // Create indexes for better performance
        await createIndexes()
        
        return dbConn
    } catch (err) {
        console.log('❌ MongoDB connection error:', err)
        logger.error('Cannot Connect to DB', err)
        throw err
    }
}

async function createIndexes() {
    try {
        console.log('🔧 Creating database indexes...')
        
        // Index for posts by owner
        const postsCollection = await dbConn.collection('posts')
        await postsCollection.createIndex({ 'owner._id': 1 })
        console.log('✅ Created index on posts.owner._id')
        
        // Index for posts by creation date (for sorting)
        await postsCollection.createIndex({ createdAt: -1 })
        console.log('✅ Created index on posts.createdAt')
        
        // Index for users by username (for lookups)
        const usersCollection = await dbConn.collection('users')
        await usersCollection.createIndex({ username: 1 }, { unique: true })
        console.log('✅ Created index on users.username')
        
        // Index for users by email (for lookups)
        await usersCollection.createIndex({ email: 1 }, { unique: true })
        console.log('✅ Created index on users.email')
        
        console.log('✅ All database indexes created successfully')
    } catch (err) {
        console.log('⚠️ Warning: Some indexes may already exist:', err.message)
        // Don't throw error for existing indexes
    }
}
