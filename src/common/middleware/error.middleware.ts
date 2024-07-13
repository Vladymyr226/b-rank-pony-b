import { Response } from 'express'
import { APIError, HttpStatusCode } from '../errors'
import { getLogger } from '../logging'

export async function errorHandlerMiddleware(err: any, res: Response) {
  let statusCode = err.status || 500

  let message = 'Something went wrong'

  if (err instanceof APIError) {
    statusCode = err.httpCode
    message = err.message
  }

  const logger = getLogger()

  logger.error(err)

  res.status(statusCode).json({ message })
}
