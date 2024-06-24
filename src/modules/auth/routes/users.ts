import { Router } from 'express'
import { userSchema } from '../validation/user.schema'
import { validateSchema } from '../../../common/middleware/validate.schema'
import { registration, login, getUsers } from '../controllers/users.controller'

export function createAuthRouter() {
  const router = Router({ mergeParams: true })
  router.post('/register', validateSchema(userSchema), registration)
  router.post('/login', login)
  router.get('/users', getUsers)
  return router
}
