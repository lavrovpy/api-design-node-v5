import { app } from './server.ts'
import { env } from '../env.ts'

app.listen(env.PORT, () => {
  console.log(`server app and running of the port ${env.PORT}`)
})
