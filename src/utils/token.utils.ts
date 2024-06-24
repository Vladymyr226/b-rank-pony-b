import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const generateToken = (id: number): string => {
  return jwt.sign({ id: id }, process.env.SECRET, { expiresIn: '100d' })
}
