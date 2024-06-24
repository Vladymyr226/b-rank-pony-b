import { Request, Response } from 'express'
import db from '../../../common/db/knexKonfig'

const paymentStatusBy = async (req: Request, res: Response) => {
  const { id } = req.query

  try {
    const payment = await db('subscriptions').where('user_id', id).orderBy('id', 'desc').first()

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    return res.status(200).json({ payment })
  } catch (error) {
    console.error('Error in paymentStatusBy.controller.ts', error)

    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export { paymentStatusBy }
