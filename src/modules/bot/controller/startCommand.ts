import { Message } from 'node-telegram-bot-api'
import { botRepository } from '../bot.repository'
import { optionsOfAdmin, optionsOfCustomer } from '../bot.config'
import { getLogger } from '../../../common/logging'
import getBotInstance from '../../common/bot'

const log = getLogger()
const bot = getBotInstance()

export const startCommandBot = async (msg: Message) => {
  const { id, username, first_name, last_name } = msg.from
  const chatId = msg.chat.id

  const isAdminByTgID = await botRepository.getAdminByTgIDEnable(id)
  const tgChangeByRole = await botRepository.getChangeRoleByID(id)

  if (isAdminByTgID.length) {
    const getSalon = await botRepository.getSalonByID({ id: isAdminByTgID[0].salon_id })

    await bot.sendMessage(
      chatId,
      `Вітаємо, ${first_name} ${last_name !== undefined ? last_name : ''} 👋\nВи є адміном закладу ${getSalon[0].name}`,
    )
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin(!!tgChangeByRole.length))
  }

  const isCustomerByTgID = await botRepository.getCustomerByID({ user_tg_id: id })

  if (isCustomerByTgID.length) {
    await bot.sendMessage(chatId, `Вітаємо, ${first_name} ${last_name !== undefined ? last_name : ''} 👋`)
    return bot.sendMessage(
      chatId,
      'Оберіть дію:',
      optionsOfCustomer(isCustomerByTgID[0].salon_id, !!tgChangeByRole.length),
    )
  }

  const customer = await botRepository.insertCustomer({
    user_tg_id: id,
    username,
    chat_id: chatId,
    first_name,
    last_name,
  })
  if (!customer.length) {
    log.error(customer)
    return bot.sendMessage(chatId, 'Error customer')
  }

  await bot.sendMessage(chatId, `Вітаємо, ${first_name} ${last_name !== undefined ? last_name : ''} 🎉`)
  return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer[0].salon_id))
}
