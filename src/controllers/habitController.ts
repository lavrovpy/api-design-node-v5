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
            tag: true
          }
        }
      },
      orderBy: [desc(habits.createdAt)]
    })

    console.log('userHabitsWithTags', userHabitsWithTags)

    const habitsWithTags = userHabitsWithTags.map(habit => ({
      ...habit,
      tags: habit.habitTags.map(ht => ht.tag),
      habitTags: undefined, // do not return the original tags ids. If the value is undefined it will be stripped out of the response
    }))

    console.log('habitsWithTags', habitsWithTags)

    res.status(200).json({habits: habitsWithTags})
  } catch(e){
    console.error('failed to get habits', e)
    res.status(500).json({error:  'failed to get habits'})
  }
}

export const updateHabit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try{

    const id = req.params.id
    const userId = req.user.id

    const { tagIds, ...updates } = req.body

    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.userId, userId), eq(habits.id, id))
    })

    if(!habit){
      return res.status(404).json({message: 'habit not found'}).end()
    }

    const result = await db.transaction(async (tx) => {
      const updatedHabit = await tx
        .update(habits)
        .set({...updates, updatedAt: new Date()})
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning()

      if(!updatedHabit){
        return res.status(401).end()
      }

      if(tagIds !== undefined){
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        if(tagIds.length > 0){
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }))

          await tx.insert(habitTags).values(habitTagValues)
        }
      }

      return updatedHabit
    })


    res.status(200).json({
      message: 'habit updated',
      habit: result
    })
  } catch(e: unknown){
    if(e instanceof Error){
      console.error('failed to get habits', e)
      res.status(500).json({error: e.cause ? e.cause : 'unknown reason for the error'})
    } else{
      console.error('failed to get habits', e)
      res.status(500).json({error: 'failed to get habits'})
    }
  }
}
