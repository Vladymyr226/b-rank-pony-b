import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import db from '../../../common/db/knexKonfig'
import { generateToken } from '../../../utils/token.utils'

export async function registration(req: Request, res: Response) {
  const { userName, email, password } = req.query

  if (!userName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(7))

  const userToDB = {
    user_name: userName,
    email,
    password: hash,
  }

  try {
    const existingUser = await db('users').where('email', email).first()

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' })
    }
    const newUser = await db('users').insert(userToDB).returning('*')
    console.log(newUser)

    const token = generateToken(newUser[0].id)
    console.log('token-registration', token)

    return res.status(201).json({ token, user: newUser[0] })
  } catch (error) {
    console.error('Error in users.controller', error)
    return res.status(400).json({ message: error })
  }
}

export async function login(req, res) {
  const { email, password } = req.query

  try {
    const user = await db.select().from('users').where('email', '=', email)
    if (!user[0]) {
      return res.status(401).json({ message: 'The email you entered does not exist!' })
    }
    if (!bcrypt.compareSync(password, user[0].password)) {
      return res.status(401).json({ message: 'The password you provided is incorrect!' })
    }
    const token = generateToken(user[0].id)
    console.log('token-login ', token)
    return res.status(200).json({ token, user: user[0] })
  } catch (error) {
    console.error('Error in users.controller.ts', error)
    return res.status(400).json({ message: error })
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const getLessons = await db.select('*').from('users')

    return res.status(200).json({ getLessons })
  } catch (error) {
    console.error('Error in users.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
