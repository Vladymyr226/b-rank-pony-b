import getBotInstance from '../common/bot'
import { TAdditionalType, TDeal, TEmployee, TService } from './bot.types'
import { startCommandBot } from './controller/startCommand'
import { adminSignUp } from './controller/adminSignUp'
import { botMessage } from './controller/botMessage'
import { callbackQueryBot } from './controller/callbackQuery'
import { pollingErrorBot } from './controller/pollingError'
import { contactTelBot } from './controller/contact'
import { photoChangeBot } from './controller/photoChange'

export const userStates: Record<number, TEmployee & Partial<TService & TDeal> & TAdditionalType> = {}

export const botCommands = () => {
  const bot = getBotInstance()

  bot.onText(/\/start/, startCommandBot)
  bot.onText(/\/sign up \d+/, adminSignUp)
  bot.on('message', botMessage)
  bot.on('callback_query', callbackQueryBot)
  bot.on('polling_error', pollingErrorBot)
  bot.on('contact', contactTelBot)
  bot.on('photo', photoChangeBot)
}
