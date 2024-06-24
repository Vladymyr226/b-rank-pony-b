import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { userSchema } from './validation/user.schema.js';
import { validateSchema } from '../../../common/middlewares/validate.js';

export const createUsersRouter = () => {
  const router = Router();
  router.post('/registration', validateSchema(userSchema), UsersController.createUser);
  router.post('/login', validateSchema(userSchema), UsersController.login);

  return router;
};
