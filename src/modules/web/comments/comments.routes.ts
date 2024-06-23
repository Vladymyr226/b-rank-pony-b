import { Router } from 'express';
import { CommentsController } from './comments.controller.js';
import { authMiddleware } from './middlewares/comments.auth.js';
import { commentSchema } from './middlewares/comments.schema.js';
import { validateSchema } from '../../../common/middlewares/validate.js';

export const createCommentsRouter = () => {
  const router = Router();
  router.post('/', validateSchema(commentSchema), authMiddleware, CommentsController.postComment);
  router.get('/', authMiddleware, CommentsController.getComment);
  return router;
};
