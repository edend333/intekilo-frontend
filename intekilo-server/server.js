import express from 'express'
import cors from 'cors'

import { carService } from './services/car.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))

const corsOptions = {
	origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
	credentials: true,
}

app.use(cors(corsOptions))

app.get('/', (req, res) => {
	res.send('Welcome to Express!!!')
})

app.get('/puki', (req, res) => {
	res.send('Hello Puki')
})

app.get('/nono', (req, res) => res.redirect('/'))

app.get('/api/car', async (req, res) => {
    const cars = await carService.query()
	res.send(cars)
})

app.get('/api/car/save', async (req, res) => {
    const { vendor, speed, _id } = req.query
    const carToSave = { vendor, speed: +speed, _id }

    const savedCar = await carService.save(carToSave)
	res.send(savedCar)
})

app.get('/api/car/:id', async (req, res) => {
    const carId = req.params.id

    try {
        const car = await carService.getById(carId)
        res.send(car)
    } catch (err) {
        loggerService.error(err)
        res.status(404).send(err)
    }

})

app.get('/api/car/:id/remove', async (req, res) => {
    const carId = req.params.id

    await carService.remove(carId)
	res.send('OK')
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
