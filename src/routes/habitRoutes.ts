import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { z } from 'zod'
import { createHabit, getUserHabits, updateHabit } from '../controllers/habitController.ts'
import { extendedInsertHabitSchemaValidation, updateHabitSchema} from '../db/schema.ts'

const completeParamsSchema = z.object({
  id: z.string().min(2)
})

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)

router.get('/:id', (req, res) => {
  res.status(200).json({message: 'one habit'})
})

router.post('/', validateBody(extendedInsertHabitSchemaValidation), createHabit)

router.patch('/:id', validateBody(updateHabitSchema), updateHabit)

router.delete('/:id', (req, res) => {
  res.status(200).json({message: 'one habit deleted'})
})

router.post('/:id/complete', validateParams(completeParamsSchema), (req, res) => {
  res.status(200).json({message: 'a habit is completed'})
})

export default router
