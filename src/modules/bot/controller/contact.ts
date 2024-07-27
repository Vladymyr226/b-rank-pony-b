import { Message } from 'node-telegram-bot-api'
import { botRepository } from '../bot.repository'
import { optionsOfCustomer } from '../bot.config'
import getBotInstance from '../../common/bot'

const bot = getBotInstance()

export const contactTelBot = async (msg: Message) => {
  const { id } = msg.from
  const { first_name, last_name, phone_number } = msg.contact

  const customer = await botRepository.getCustomerByID({ user_tg_id: id })
  const admin = await botRepository.getAdminByID({ salon_id: customer[0].salon_id })

  if (!customer[0].phone_number) await botRepository.putCustomer(id, { phone_number })
  const getReplicateEnable = await botRepository.getReplicateEnable(customer[0].id)

  const formattedMessage = `\u{1F464} ${first_name} ${last_name !== undefined ? last_name : ''}\n📞 ${phone_number}\n Замовлений здвінок`
  await bot.sendMessage(admin[0].chat_id, formattedMessage, {
    parse_mode: 'HTML',
  })
  await bot.sendMessage(msg.chat.id, `Добре, очікуйте, майстер з вами зв'яжеться найближчим часом!`)
  return await bot.sendMessage(
    msg.chat.id,
    'Оберіть дію:',
    optionsOfCustomer(customer[0].salon_id, { replicate_enable: !!getReplicateEnable.length }),
  )
}
