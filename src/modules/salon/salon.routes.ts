import { registrationHandler } from './salon.controller'
import { Router } from 'express'
import { validateSchema } from '../../common/middleware/validate'
import { salonSchema } from './salon.schema'

export function createSalonRouter() {
  const router = Router({ mergeParams: true })

  router.post('/', validateSchema(salonSchema), registrationHandler)

  return router
}
