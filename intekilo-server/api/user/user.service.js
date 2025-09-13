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
    getByEmail,
    add,
}

async function query() {
    try {
        const collection = await dbService.getCollection('users')
        const users = await collection.find({}).toArray()
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: ObjectId.createFromHexString(userId) }
            : { _id: userId }

        const collection = await dbService.getCollection('users')
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
        // Handle both string IDs and ObjectId
        const criteria = userId.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: ObjectId.createFromHexString(userId) }
            : { _id: userId }

        if (!isAdmin) criteria._id = ownerId

        const collection = await dbService.getCollection('users')
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
        imgUrl: user.imgUrl
    }

    try {
        // Handle both string IDs and ObjectId
        const criteria = user._id.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: ObjectId.createFromHexString(user._id) }
            : { _id: user._id }

        const collection = await dbService.getCollection('users')
        await collection.updateOne(criteria, { $set: userToSave })

        return user
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username ${username}`, err)
        throw err
    }
}

async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection('users')
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        logger.error(`while finding user by email ${email}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const collection = await dbService.getCollection('users')
        const result = await collection.insertOne(user)
        return user
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}