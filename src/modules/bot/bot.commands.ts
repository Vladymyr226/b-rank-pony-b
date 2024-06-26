import getBotInstance from '../common/bot'
import { BotController } from './bot.controller'

export const botCommands = () => {
  const bot = getBotInstance()

  bot.onText(/\/start/, BotController.startCommandBot)

  bot.onText(/Чина/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Саундтрек, санчізес, сюда-а')
  })

  bot.onText(/\/sign up \d+/, BotController.adminSignUp)

  bot.on('callback_query', BotController.callbackQueryBot)

  bot.on('polling_error', BotController.pollingErrorBot)

  bot.on('contact', BotController.contactTelBot)

  bot.on('photo', BotController.photoChangeBot)
}
