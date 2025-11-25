import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { z } from 'zod'
import { createHabit } from '../controllers/habitController.ts'
import { extendedInsertHabitSchemaValidation } from '../db/schema.ts'

const completeParamsSchema = z.object({
  id: z.string().min(2)
})

const router = Router()

router.use(authenticateToken)

router.get('/', (req, res) => {
  res.status(200).json({message: 'habits'})
})

router.get('/:id', (req, res) => {
  res.status(200).json({message: 'one habit'})
})

router.post('/', validateBody(extendedInsertHabitSchemaValidation), createHabit)

router.delete('/:id', (req, res) => {
  res.status(200).json({message: 'one habit deleted'})
})

router.post('/:id/complete', validateParams(completeParamsSchema), (req, res) => {
  res.status(200).json({message: 'a habit is completed'})
})

export default router
