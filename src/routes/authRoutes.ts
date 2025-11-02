import { Router } from 'express'

const router = Router()

router.post('/register', (req, res) => {
  res.json({
    message: 'registered'
  }).status(201)
})

router.post('/login', (req, res) => {
  res.status(201).json({message: 'logged it'})
})

export default router
