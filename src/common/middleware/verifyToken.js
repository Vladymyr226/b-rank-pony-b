import jwt from 'jsonwebtoken'
import { db } from '../db/knexKonfig'

export async function verifyToken(req, res, next) {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(401).json({ message: 'Token is not provided' })
  }

  try {
    const decoded = await jwt.verify(token, process.env.SECRET)
    const userId = decoded.id

    console.log([userId])

    const user = await db('users').where('id', userId).first()

    if (!user) {
      return res.status(400).json({ message: 'The token you provided is invalid' })
    }

    next()
  } catch (error) {
    return res.status(400).json(error)
  }
}
