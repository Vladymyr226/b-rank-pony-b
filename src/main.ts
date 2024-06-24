import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Router } from 'express'
import { errorHandlerMiddleware } from './common/middleware/error.middleware'
import './common/dotenv.config'
import OpenAIApi from 'openai'
import { configureHealthCheckRouter } from './modules/common/routes/healthcheck.routes'
import { getLogger } from './common/logging'
import getBotInstance from './modules/common/bot'
import { botCommands } from './modules/bot/bot.commands'

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_KEY,
})

getBotInstance()
botCommands()

const { PORT } = process.env

const app = express()
const log = getLogger()
log.info('Starting application')

app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function addApiRoutes() {
  const router = Router({ mergeParams: true })

  return router
}

app.use('/api', addApiRoutes())

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
