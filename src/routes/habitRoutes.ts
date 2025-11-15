import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'

const createHabitSchema = z.object({
  name: z.string()
})

const completeParamsSchema = z.object({
  id: z.string().min(2)
})

const router = Router()

router.get('/', (req, res) => {
  res.status(200).json({message: 'habits'})
})

router.get('/:id', (req, res) => {
  res.status(200).json({message: 'one habit'})
})

router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.json({message: 'created habit'}).status(201)
})

router.delete('/:id', (req, res) => {
  res.status(200).json({message: 'one habit deleted'})
})

router.post('/:id/complete', validateParams(completeParamsSchema), (req, res) => {
  res.status(200).json({message: 'a habit is completed'})
})

export default router
