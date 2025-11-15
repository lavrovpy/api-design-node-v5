import db from './connection.ts'
import {users, habits, entries, tags, habitTags} from './schema.ts'


const seed = async() => {
  try{
    console.log('Clearing existing data...')
    await db.delete(users)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(entries)
    await db.delete(tags)

    console.log('Creating demo users...')

    const [user] = await db
      .insert(users)
      .values({
        email: 'pussy-destroyer69@gmail.com',
        password: 'biggerThanYourMom420',
        firstName: 'Johnny',
        lastName: 'Sins',
        username: 'pussy-destroyer69'
      })
      .returning()

    console.log('Creating tags...')
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: 'Health',
        color: '#f0f0f0'
      })
      .returning()

    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: user.id,
        name: 'Exercise',
        description: 'Daily workout',
        frequency: 'daily',
        targetCount: 1
      })
      .returning()

    await db
      .insert(habitTags)
      .values({
        habitId: exerciseHabit.id,
        tagId: healthTag.id
      })

    console.log('Adding completion entries...')

    const today = new Date()
    today.setHours(12, 0, 0, 0)

    for (let i = 0; i < 7; i++){
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
      })
    }

    console.log('DB Seeded successfully')
    console.log('User credentials:')
    console.log(`Username: ${user.username}`)
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${user.password}`)
  } catch (e) {
    console.error('seed failed', e)
    process.exit(1)
  }
}

if(import.meta.url === `file://${process.argv[1]}`){
  seed()
    .then(() => process.exit(0))
    .catch((e) => process.exit(1))
}

export default seed
