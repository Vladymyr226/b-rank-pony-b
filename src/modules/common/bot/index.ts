import TelegramBot from 'node-telegram-bot-api'

let botInstance = null

const getBotInstance = () => {
  if (!botInstance) {
    botInstance = new TelegramBot(process.env.TG_BOT_TOKEN, {
      polling: true,
    })
  }
  return botInstance
}

export default getBotInstance
