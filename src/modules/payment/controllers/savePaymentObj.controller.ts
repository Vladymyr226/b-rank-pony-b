import { Request, Response } from 'express'
import db from '../../../common/db/knexKonfig'

const savePaymentObj = async (req: Request, res: Response) => {
  const { merchant_data, order_status } = req.body

  const paymentResult = req.body

  const paymentToDB = {
    user_id: merchant_data,
    order_status,
    payment: paymentResult,
  }

  try {
    const payment = await db('subscriptions').insert(paymentToDB).returning('*')
    console.log(payment)

    return res.status(201).json({ message: 'OK' })
  } catch (error) {
    console.error('Error in savePaymentObj.controller.ts', error)
    return res.status(400).json({ message: error })
  }
}

export { savePaymentObj }
