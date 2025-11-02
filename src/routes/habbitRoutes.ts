import { Router } from 'express'
import { validateBody } from '../middleware/validation.ts'
import { z } from 'zod'

const createHabbitSchema = z.object({
  name: z.string()
})

const router = Router()

router.get('/', (req, res) => {
  res.status(200).json({message: 'habbits'})
})

router.get('/:id', (req, res) => {
  res.status(200).json({message: 'one habbit'})
})

router.post('/', validateBody(createHabbitSchema), (req, res) => {
  res.json({message: 'created habbit'}).status(201)
})

router.delete('/:id', (req, res) => {
  res.status(200).json({message: 'one habbit deleted'})
})

router.post('/:id/complete', (req, res) => {
  res.status(200).json({message: 'a habbit is completed'})
})

export default router
