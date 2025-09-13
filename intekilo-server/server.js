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
import { setupSocketAPI } from './services/socket.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { loggerService as logger } from './services/logger.service.js'
import { commentRoutes } from './api/comment/comment.routes.js'

const app = express()
const server = http.createServer(app)

app.use(cookieParser())
app.use(express.json())
app.use(setupAsyncLocalStorage)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')))
} else {
  app.use(cors({
    origin: [
      'http://127.0.0.1:8080',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://localhost:3030',
    ],
    credentials: true,
  }))
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/review', reviewRoutes)

// setupSocketAPI(server)

// fallback – לשים בסוף
// app.get('/*', (req, res) => {
//   res.sendFile(path.resolve('public/index.html'))
// })

const port = process.env.PORT || 3030

const startServer = async () => {
  try {
    await connectDB()
    server.listen(port, () => {
      logger.info('Server is running on: ' + `http://localhost:${port}/`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()