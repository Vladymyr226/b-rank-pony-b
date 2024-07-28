import { Request, Response } from 'express'
import { salonRepository } from './salon.repository'

export const registrationHandler = async (req: Request, res: Response) => {
  const order = await salonRepository.insertOrder(req.body)

  if (order.length) res.status(200).json({ status: 'OK' })
  else res.status(400).json({ details: [{ message: `Виникла помилка. Спробуйте знову.` }] })
}
