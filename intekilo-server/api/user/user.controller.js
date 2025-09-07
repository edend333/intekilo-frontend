import { logger } from '../../services/logger.service.js'
import { userService } from './user.service.js'

export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.json(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function getUserById(req, res) {
    try {
        const userId = req.params.id
        const user = await userService.getById(userId)
        res.json(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function updateUser(req, res) {
    const { loggedinUser, body: user } = req
    const { _id: userId, isAdmin } = loggedinUser

    if (!isAdmin && user._id !== userId) {
        res.status(403).send('Not your user...')
        return
    }

    try {
        const updatedUser = await userService.update(user)
        res.json(updatedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function removeUser(req, res) {
    try {
        const userId = req.params.id
        const removedId = await userService.remove(userId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove user', err)
        res.status(400).send({ err: 'Failed to remove user' })
    }
}

