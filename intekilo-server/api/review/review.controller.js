import { logger } from '../../services/logger.service.js'
import { broadcast, emitToUser, emitTo } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { reviewService } from './review.service.js'

export async function getReviews(req, res) {
    try {
        const reviews = await reviewService.query(req.query)
        res.send(reviews)
    } catch (err) {
        logger.error('Cannot get reviews', err)
        res.status(400).send({ err: 'Failed to get reviews' })
    }
}

export async function deleteReview(req, res) {
    var { loggedinUser } = req
    const { id: reviewId } = req.params

    try {
        const deletedCount = await reviewService.remove(reviewId)
        if (deletedCount === 1) {
            broadcast({ type: 'review-removed', data: reviewId, userId: loggedinUser._id })
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove review' })
        }
    } catch (err) {
        logger.error('Failed to delete review', err)
        res.status(400).send({ err: 'Failed to delete review' })
    }
}

export async function addReview(req, res) {
    var { loggedinUser } = req

    try {
        var review = req.body
        const { aboutUserId } = review
        review.byUserId = loggedinUser._id
        review = await reviewService.add(review)

        //* prepare the updated review for sending out
        review.byUser = loggedinUser
        review.aboutUser = await userService.getById(aboutUserId)

        delete review.aboutUser.givenReviews
        delete review.aboutUserId
        delete review.byUserId

        broadcast({ type: 'review-added', data: review, userId: loggedinUser._id })
        emitToUser({ type: 'review-about-you', data: review, userId: review.aboutUser._id })

        const fullUser = await userService.getById(loggedinUser._id)
        emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })

        res.send(review)
    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(400).send({ err: 'Failed to add review' })
    }
}
