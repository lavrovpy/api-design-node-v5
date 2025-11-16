import type {Request, Response} from 'express'
import {db} from '../db/connection.ts'
import { eq } from 'drizzle-orm'
import {users} from '../db/schema.ts'
import type { NewUser } from '../db/schema.ts'
import { generateToken } from '../utils/jwt.ts'
import { hashPassword, comparePasswords } from '../utils/passwords.ts'

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

export const login = async(req: Request<any, any, {email: string; password: string}>, res: Response) => {
  try{

    const {email, password} = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email))
    if(!user){
      res.status(401).json({
        error: 'Username or a password is incorrect'
      })
    }

    const isCorrect = await comparePasswords(password, user.password)

    if(isCorrect){
      const token = await generateToken({
        id: user.id,
        email: user.email,
        username: user.username
      })
      res.status(200).json({
        message: 'Logged In!',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token
      })
    } else {
      res.status(401).json({
        error: 'Username or a password is incorrect'
      })
    }
  } catch(e){
    console.error('Login error', e)
    res.status(500).json({error: 'Failed to login'})
  }
}
