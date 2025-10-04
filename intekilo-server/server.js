import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/mongoConnect.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { postRoutes } from './api/post/post.routes.js'
import { storyRoutes } from './api/story/story.routes.js'
import { setupSocketAPI } from './services/socket.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { loggerService as logger } from './services/logger.service.js'
import { commentRoutes } from './api/comment/comment.routes.js'

const app = express()
const server = http.createServer(app)

app.use(cookieParser())
app.use(express.json())
app.use(setupAsyncLocalStorage)

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') || ['https://your-frontend-domain.com']
    : [
        'http://127.0.0.1:8080',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://localhost:3030',
      ],
  credentials: true,
}
app.use(cors(corsOptions))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')))
}

// Add logging for all API requests
app.use('/api', (req, res, next) => {
    console.log('🌐 API Request:', req.method, req.url)
    logger.info(`API ${req.method} ${req.url}`)
    next()
})

// Health check endpoint
app.get('/api/ping', (req, res) => {
  res.json({ ok: true })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/stories', storyRoutes)

// setupSocketAPI(server)

// fallback – לשים בסוף
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

const port = process.env.PORT || 3030
const host = '0.0.0.0'
console.log('Server starting on port:', port)


const startServer = async () => {
  try {
    await connectDB()
    
    // Run comment migration on server start
    try {
      const { commentService } = await import('./api/comment/comment.service.js')
      await commentService.migrateOldComments()
    } catch (migrationError) {
      logger.error('Comment migration failed:', migrationError)
      // Don't exit - server can still run without migration
    }
    
    server.listen(port, host, () => {
      logger.info(`Server is running on: http://${host}:${port}/`)
      console.log(`✅ Server listening on port ${port}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()