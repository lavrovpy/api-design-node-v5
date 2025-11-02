import express from 'express'
import authRouter from './routes/authRoutes.ts'
import habbitRouter from './routes/habbitRoutes.ts'
import userRouter from './routes/userRoutes.ts'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { isTest } from '../env.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors({
  origin: ['localhost:4142']
}))
app.use(morgan('dev', {
  skip: () => isTest()
}))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Habit Tracker API'
  })
})

app.post('/cake', (req, res) => {
  res.send('cake').status(200)
})

app.post('/cake/:name/:id', (req, res) => {
  res.send(`${req.params.name} - ${req.params.id}`)
})

app.post('/cake-json/:name/:id', (req, res) => {
  res.json(req.params)
})

app.use('/api/auth', authRouter)
app.use('/api/habbits', habbitRouter)
app.use('/api/users', userRouter)

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  })
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

export { app }
export default app
