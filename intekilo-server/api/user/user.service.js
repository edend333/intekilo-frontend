import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const userService = {
    remove,
    query,
    getById,
    update,
    getByUsername,
    add,
}

async function query() {
    try {
        const collection = await dbService.getCollection('user')
        const users = await collection.find({}).toArray()
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)

        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}

async function remove(userId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

    try {
        const criteria = {
            _id: ObjectId.createFromHexString(userId),
        }

        if (!isAdmin) criteria._id = ownerId

        const collection = await dbService.getCollection('user')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw ('Not your user')
        return userId
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    const userToSave = { 
        username: user.username, 
        fullname: user.fullname, 
        imgUrl: user.imgUrl,
        score: user.score 
    }

    try {
        const criteria = { _id: ObjectId.createFromHexString(user._id) }
        const collection = await dbService.getCollection('user')
        await collection.updateOne(criteria, { $set: userToSave })

        return user
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username ${username}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.insertOne(user)
        return user
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}
