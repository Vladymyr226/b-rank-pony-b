import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Router } from 'express'
import { errorHandlerMiddleware } from './common/middleware/error.middleware'
import './common/dotenv.config'
import { configureHealthCheckRouter } from './modules/common/routes/healthcheck.routes'
import { getLogger } from './common/logging'
import getBotInstance from './modules/common/bot'
import { botCommands } from './modules/bot/bot.commands'
import { runMigrations } from './common/db/migrations'
import cronJobs from './modules/common/cron/'

getBotInstance()
botCommands()

const { PORT, AUTO_MIGRATION, CRON_JOB_STOP } = process.env

const app = express()
const log = getLogger()
log.info('Starting application')

app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function addApiRoutes() {
  if (+AUTO_MIGRATION) await runMigrations()
  if (+CRON_JOB_STOP) cronJobs.stop()

  const router = Router({ mergeParams: true })

  return router
}

;(async () => {
  const apiRouter = await addApiRoutes()
  app.use('/api', apiRouter)
})()

configureHealthCheckRouter(app)

app.use(errorHandlerMiddleware)

let port = parseInt(PORT, 10)

if (!port) {
  log.warn({}, 'Port is not defined, using default')
  port = 5000
}

app.listen(process.env.PORT, () => {
  log.info(
    {
      port: PORT,
    },
    'listening...',
  )
})
