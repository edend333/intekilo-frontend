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

        console.log('✅ MongoDB Connected!')

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            // Silent error handling
        })

        mongoose.connection.on('disconnected', () => {
            // Silent disconnect handling
        })

        mongoose.connection.on('reconnected', () => {
            // Silent reconnect handling
        })

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close()
                process.exit(0)
            } catch (err) {
                process.exit(1)
            }
        })

    } catch (error) {
        process.exit(1)
    }
}

export default connectDB
