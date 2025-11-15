import type {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import {db} from './db/connection.ts'
import {users} from './db/schema.ts'
import type { NewUser } from './db/schema.ts'
import { generateToken } from './utils/jwt.ts'
import { hashPassword } from './utils/passwords.ts'

export const register = async (req: Request<any, any, NewUser>, res: Response) => {
  try{
    const {email, username, password, firstName, lastName} = req.body
    const hashedPassword = await hashPassword(password)
    const [user] = await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName
    })
    .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return res.status(201).json({
      message: 'User created',
      user,
      token,
    })

  } catch(e){
    console.error('Registration error', e)
    res.status(500).json({error: 'Failed to create a user'})
  }
}
