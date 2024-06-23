import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { createAuthRouter } from './modules/auth/routes/users'
import cors from 'cors'
import { Router } from 'express'
import { createPaymentRouter } from './modules/payment/routes/payment'
import { errorHandlerMiddleware } from './middleware/error.middleware'
import './configs/dotenv.config'
import { createCabinetRouter } from './modules/routes/routes'

const app = express()

app.use(express.json())

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function addApiRoutes() {
  const router = Router({ mergeParams: true })

  router.use('/auth', createAuthRouter())
  router.use('/cabinet', createCabinetRouter())
  router.use('/payment', createPaymentRouter())

  return router
}

app.use('/api', addApiRoutes())

app.get('/', (req: Request, res: Response) => {
  res.status(200).json('Health check works!')
})

// app.use(errorHandlerMiddleware)

app.listen(process.env.PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.PORT}`)
})

export default app
