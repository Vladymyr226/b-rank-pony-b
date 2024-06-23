import { Router } from 'express'
import { userSchema } from '../validation/user.schema'
import { validateSchema } from '../../../middleware/validate.schema'
import { registration, login, getUsers } from '../controllers/users.controller'

export function createAuthRouter() {
  const router = Router({ mergeParams: true })

  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: Authentication and registration
   */

  /**
   * @swagger
   * /register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]

   *     description: Register a new user with name, surname, email, and password.
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - surname
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 description: First name of the user
   *               surname:
   *                 type: string
   *                 description: Last name of the user
   *               email:
   *                 type: string
   *                 description: Email address of the user
   *               password:
   *                 type: string
   *                 description: Password for the user account
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Authentication token
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     first_name:
   *                       type: string
   *                     last_name:
   *                       type: string
   *                     email:
   *                       type: string
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       409:
   *         description: Conflict - user already exists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */

  router.post('/register', validateSchema(userSchema), registration)

  /**
   * @swagger
   * /login:
   *   post:
   *     summary: User login
   *     tags: [Auth]
   *     description: Login a user with email and password.
   *     requestBody:
   *       required: true
   *       content:
   *         application/x-www-form-urlencoded:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 description: Email address of the user
   *               password:
   *                 type: string
   *                 description: Password for the user account
   *     responses:
   *       200:
   *         description: Successful login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Authentication token
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     first_name:
   *                       type: string
   *                     last_name:
   *                       type: string
   *                     email:
   *                       type: string
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  router.post('/login', login)
  router.get('/users', getUsers)
  return router
}
