import { Request, Response } from 'express'
import { salonRepository } from './salon.repository'
import getBotInstance from '../common/bot'
import { getLogger } from '../../common/logging'

const log = getLogger()
const bot = getBotInstance()

export const registrationHandler = async (req: Request, res: Response) => {
  const order = await salonRepository.insertOrder(req.body)

  if (order.length) {
    await bot.sendMessage(
      '-4225519854',
      `New order: 
id: ${order[0].id}`,
    )

    log.info(`New order: id: ${order[0].id}`)

    res.status(200).json({ status: 'OK' })
  } else res.status(400).json({ details: [{ message: `Виникла помилка. Спробуйте знову.` }] })
}
