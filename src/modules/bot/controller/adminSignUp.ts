import { Message } from 'node-telegram-bot-api'
import { botRepository } from '../bot.repository'
import { optionsOfAdmin } from '../bot.config'
import { getLogger } from '../../../common/logging'
import getBotInstance from '../../common/bot'
import { TAdmin } from '../bot.types'

const log = getLogger()
const bot = getBotInstance()

export const adminSignUp = async (msg: Message, match: RegExpExecArray | null) => {
  const { id, username, first_name, last_name } = msg.from
  const chatId = msg.chat.id

  const isHasAdminByTgID = await botRepository.getAdminByID({ user_tg_id: id })

  if (isHasAdminByTgID.length) {
    return bot.sendMessage(id, 'Ви вже зареєстровані', optionsOfAdmin())
  }

  if (!match) return

  const salon_id = +match[0].split(' ')[2]

  const isHasSalon = await botRepository.getSalonByID({ id: salon_id })

  if (!isHasSalon.length) {
    log.error('Salon by ID: ' + salon_id + ' is disappeared')
    return bot.sendMessage(chatId, 'Нажаль, заклад не знайдено')
  }

  let admin: Array<TAdmin> = null

  try {
    admin = await botRepository.insertAdmin({
      user_tg_id: id,
      salon_id,
      username,
      first_name,
      last_name,
      chat_id: chatId,
    })
  } catch (error) {
    if (error instanceof Error && (error as any).code === '23505') {
      log.error('Duplicate key value violates unique constraint:', 'admin_id =', id, (error as any).detail)
      return bot.sendMessage(chatId, 'Адмін для такого закладу вже існує')
    } else {
      return log.error('Database error:', error)
    }
  }

  if (!admin.length) {
    log.error(admin)
    return bot.sendMessage(chatId, 'Error admin')
  }

  await bot.sendMessage(chatId, `Вітаємо, ${first_name} ${last_name !== undefined ? last_name : ''} 🎉`)
  return await bot.sendMessage(chatId, 'Ви є адміном закладу ' + isHasSalon[0].name)
}
