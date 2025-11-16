import { Router } from 'express'
import {z} from 'zod'
import { register, login } from '../controllers/authController.ts'
import { extendedInsertUserSchemaValidatioin } from '../db/schema.ts'
import { validateBody } from '../middleware/validation.ts'

const loginSchema = z.object({
  email: z.email(),
  password: z.string()
})
const router = Router()

router.post('/register', validateBody(extendedInsertUserSchemaValidatioin), register)

router.post('/login', validateBody(loginSchema), login)

export default router
