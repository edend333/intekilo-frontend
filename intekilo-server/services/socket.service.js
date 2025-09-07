import { Server } from 'socket.io'
import { logger } from './logger.service.js'

let gIo

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: [
                'http://127.0.0.1:8080',
                'http://localhost:3000',
                'http://127.0.0.1:5173',
                'http://localhost:5173'
            ],
            credentials: true
        }
    })

    gIo.on('connection', (socket) => {
        logger.info(`New connected socket [id: ${socket.id}]`)
        
        socket.on('disconnect', (socket) => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })

        socket.on('chat-set-topic', (topic) => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)
            }
            socket.join(topic)
            socket.myTopic = topic
            logger.info(`Socket joined topic ${topic} [id: ${socket.id}]`)
        })

        socket.on('chat-send-msg', (msg) => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
            gIo.to(socket.myTopic).emit('chat-add-msg', msg)
        })

        socket.on('user-watch', (userId) => {
            logger.info(`user-watch from socket [id: ${socket.id}], on user ${userId}`)
            socket.join(`watching:${userId}`)
        })

        socket.on('set-user-socket', (userId) => {
            logger.info(`Setting socket for user ${userId} [id: ${socket.id}]`)
            socket.userId = userId
        })

        socket.on('unset-user-socket', () => {
            logger.info(`Removing socket for user ${socket.userId} [id: ${socket.id}]`)
            delete socket.userId
        })
    })
}

export function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

export function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}

export function broadcast({ type, data, room = null }) {
    if (room) {
        gIo.to(room).emit(type, data)
    } else {
        gIo.emit(type, data)
    }
}

