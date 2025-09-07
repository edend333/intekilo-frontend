import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL
        const dbName = process.env.DB_NAME

        if (!mongoUrl) {
            throw new Error('MONGO_URL is not defined in environment variables')
        }

        if (!dbName) {
            throw new Error('DB_NAME is not defined in environment variables')
        }

        console.log('🔄 Connecting to MongoDB...')
        
        const conn = await mongoose.connect(mongoUrl, {
            dbName: 'Intekilo', // Use exact case from MongoDB
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
        console.log(`📊 Database: ${dbName}`)

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err)
        })

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected')
        })

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected')
        })

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close()
                console.log('🔒 MongoDB connection closed through app termination')
                process.exit(0)
            } catch (err) {
                console.error('❌ Error closing MongoDB connection:', err)
                process.exit(1)
            }
        })

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message)
        process.exit(1)
    }
}

export default connectDB
