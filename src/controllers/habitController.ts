import type { Response } from 'express'
import type { AuthenticatedRequest } from './../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try{
    const { name, description, frequency, targetCount, tagIds } = req.body
    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx.insert(habits).values({
        userId: req.user.id,
        name,
        description,
        frequency,
        targetCount,
      }).returning()

      if(tagIds && tagIds.length > 0){
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId
        }))

        await tx.insert(habitTags).values(habitTagValues)
      }

      return newHabit
    })

    res.status(201).json({
      message: 'Habit created',
      habit: result
    })
  } catch(e) {
    console.error('create habit failed', e)
    res.status(500).json({error: 'failed to create habit'})
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response
)  =>  {
  try{
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          }
        }
      }
    })
  } catch(e){
    console.error('failed to get habits', e)
    res.status(500).json({error:  'failed to get habits'})
  }
}
