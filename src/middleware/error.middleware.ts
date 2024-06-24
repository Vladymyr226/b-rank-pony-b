import { Response } from 'express'
import { ValidationError } from 'joi'

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export const CREATED = 'CREATED'
export const UPDATED = 'UPDATED'
export const DELETED = 'DELETED'

export async function errorHandlerMiddleware(err: any, res: Response) {
  let statusCode = err.status || 500

  let message = 'Something went wrong'

  if (err instanceof ValidationError) {
    statusCode = HttpStatusCode.BAD_REQUEST
    message = err.details[0].message
  }

  const errorDetails = {
    error: err.message,
    stack: err.stack,
  }

  console.error('Error in errorHandlerMiddleware:', errorDetails)

  res.status(statusCode).json({ message })
}
