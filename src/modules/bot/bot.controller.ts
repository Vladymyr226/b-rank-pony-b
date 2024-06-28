import { CallbackQuery, Message, Metadata } from 'node-telegram-bot-api'
import { tgCalendar, optionsOfCustomer, optionsOfAdmin } from './bot.config'
import getBotInstance from '../common/bot'
import { getLogger } from '../../common/logging'
import { botRepository } from './bot.repository'
import { TEmployee, TEmployeeWithServiceName, TService } from './bot.types'

const log = getLogger()
const bot = getBotInstance()
const userStates: Record<number, TEmployee & Partial<TService> & { step: string; service_id?: number }> = {}

const startCommandBot = async (msg: Message) => {
  const { id, username, first_name, last_name } = msg.from
  const chatId = msg.chat.id

  const isAdminByTgID = await botRepository.getAdminByTgIDEnable(id)

  if (isAdminByTgID.length) {
    await bot.sendMessage(chatId, 'Вітаємо, ' + first_name + ' ' + last_name)
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
  }

  const isCustomerByTgID = await botRepository.getCustomerByTgID(id)

  if (isCustomerByTgID.length) {
    await bot.sendMessage(chatId, 'Вітаємо, ' + first_name + ' ' + last_name)
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer)
  }

  const customer = await botRepository.insertCustomer({
    user_tg_id: id,
    username,
    first_name,
    last_name,
  })
  if (!customer.length) {
    log.error(customer)
    return bot.sendMessage(chatId, 'Error customer')
  }

  await bot.sendMessage(chatId, 'Вітаємо, ' + first_name + ' ' + last_name + '🎉')
  return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer)
}

const adminSignUp = async (msg: Message, match: RegExpExecArray | null) => {
  const { id, username, first_name, last_name } = msg.from
  const chatId = msg.chat.id

  const isHasAdminByTgID = await botRepository.getAdminByTgID(id)

  if (isHasAdminByTgID.length) {
    return bot.sendMessage(id, 'Ви вже зареєстровані', optionsOfAdmin)
  }

  if (!match) return

  const salon_id = +match[0].split(' ')[2]

  const isHasSalon = await botRepository.getSalonByID(salon_id)

  if (!isHasSalon.length) {
    log.error('Salon by ID: ' + salon_id + ' is disappeared')
    return bot.sendMessage(chatId, 'Нажаль, заклад не знайдено')
  }

  const admin = await botRepository.insertAdmin({
    user_tg_id: id,
    salon_id,
    username,
    first_name,
    last_name,
    chat_id: chatId,
  })

  if (!admin.length) {
    log.error(admin)
    return bot.sendMessage(chatId, 'Error admin')
  }

  await bot.sendMessage(chatId, 'Вітаємо, ' + first_name + ' ' + last_name + '🎉')
  await bot.sendMessage(chatId, 'Ви адмін закладу ' + isHasSalon[0].name)
  return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
}

const messageBot = async (msg: Message, metaData: Metadata) => {
  const chatId = msg.chat.id
  const text = msg.text

  const userState = userStates[chatId]

  if (userState) {
    switch (userState.step) {
      case 'name':
        userState.name = text
        userState.step = 'description'
        await bot.sendMessage(chatId, 'Введіть опис послуги')
        break
      case 'description':
        userState.description = text
        userState.step = 'price'
        await bot.sendMessage(chatId, 'Введіть ціну послуги (в грн)')
        break
      case 'price':
        userState.price = +text
        userState.step = 'duration'
        await bot.sendMessage(chatId, 'Введіть тривалість послуги (в хвилинах)')
        break
      case 'first_name':
        userState.first_name = text
        userState.step = 'phone'
        await bot.sendMessage(chatId, 'Введіть номер телефону')
        break
      case 'phone':
        userState.phone = text
        userState.step = 'work_hour_from'
        await bot.sendMessage(chatId, 'Працює з (формат ЧЧ:ХХ)')
        break
      case 'work_hour_from':
        userState.work_hour_from = text
        userState.step = 'work_hour_to'
        await bot.sendMessage(chatId, 'Працює до (формат ЧЧ:ХХ)')
        break
      case 'duration':
        userState.duration = +text
        delete userState.step

        try {
          await botRepository.insertService(userState as TService)
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Дані послуги збережені. Дякуємо!')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        } catch (e) {
          log.error(e)
          await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        }
      case 'work_hour_to':
        userState.work_hour_to = text
        const { service_id } = userState
        delete userState.service_id
        delete userState.step

        try {
          const employee = await botRepository.insertEmployee(userState)
          await botRepository.insertEmployeesServices({ employee_id: employee[0].id, service_id })
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Дані співробітника збережено. Дякуємо!')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        } catch (e) {
          log.error(e)
          await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        }

      default:
        await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
        return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
    }
  }
}

const callbackQueryBot = async (query: CallbackQuery) => {
  const { id } = query.from
  const chatId = query.message.chat.id
  const data = query.data

  if (data === '1') {
    return bot.sendMessage(
      chatId,
      `
1. "Блискучий Блиск" - манікюр + покриття гель-лаком - *350 грн*

2. "Дивовижний Вигляд" - професійний макіяж на вечірку - *500 грн*

3. "Відновлення Волосся" - процедура глибокого зволоження волосся - *600 грн*

4. "Релаксаційна Розкіш" - масаж обличчя та шиї - *400 грн*

5. "Розкішні Ресниці" - нарощування вій (класичне) - *700 грн*

6. "Чарівна Зміна" - стрижка + укладка - *800 грн*
`,
      {
        parse_mode: 'Markdown',
      },
    )
  }

  if (data === '2') {
    return bot.sendMessage(chatId, 'Надішліть ваш контакт, натиснувши кнопку "Поділитися моїм контактом"', {
      reply_markup: {
        keyboard: [[{ text: 'Поділитися моїм контактом', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data === '3') {
    return tgCalendar(bot).startNavCalendar(query.message)
  }

  const calendarTimeResponse = tgCalendar(bot).clickButtonCalendar(query)

  if (calendarTimeResponse !== -1) {
    return bot.sendMessage(query.message.chat.id, '✅ Ви успішно здійснили запис до фахівця: ' + calendarTimeResponse)
  }

  if (data === '4') {
    return bot.sendMessage(chatId, 'Будь ласка, надішліть своє фото для генерації стильної зачіски.')
  }

  if (data === '5') {
    return bot.sendMessage(chatId, 'Чиназес 🎉')
  }

  if (data === '6') {
    const admin = await botRepository.getAdminByTgID(id)

    userStates[chatId] = { step: 'name', salon_id: admin[0].salon_id }
    return await bot.sendMessage(chatId, 'Введіть назву послуги')
  }

  if (data === '7') {
    const admin = await botRepository.getAdminByTgID(id)
    const services = await botRepository.getServiceBySalonID(admin[0].salon_id)

    return bot.sendMessage(chatId, 'Виберіть позицію:', {
      reply_markup: {
        inline_keyboard: services.map((item) => [{ text: item.name, callback_data: `service_${item.id}` }]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data.startsWith('service_')) {
    const service_id = +data.split('_')[1]
    const admin = await botRepository.getAdminByTgID(id)

    userStates[chatId] = { step: 'first_name', salon_id: admin[0].salon_id, service_id }
    return await bot.sendMessage(chatId, 'Введите имя')
  }

  if (data === '8') {
    const formatEmployeeInfo = (employee: TEmployeeWithServiceName) => {
      return `*Имя:* ${employee.first_name}
*Телефон:* ${employee.phone}
*Рабочие часы:* ${employee.work_hour_from} - ${employee.work_hour_to}
*Услуги:* ${employee.services.join(', ')}`
    }

    try {
      const services = await botRepository.getEmployeeWithServices()

      const messages = services.map(formatEmployeeInfo).join('\n\n')
      await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
      return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
    } catch (err) {
      log.error(err)
    }
  }
}

const pollingErrorBot = (error) => {
  log.error(error)
}

const contactTelBot = (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `Добре, очікуйте, майстер з вами зв'яжеться найближчим часом!`)
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', optionsOfCustomer)
}

const photoChangeBot = async (msg) => {
  const chatId = msg.chat.id
  const photoId = msg.photo[0].file_id

  const photoInfo = await bot.getFile(photoId)
  const photoUrl = `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${photoInfo.file_path}`

  const prompt = 'show more haircut options for this person'

  // model: 'dall-e-2',
  // image: fs.createReadStream(photoUrl),
  // prompt,
  // n: 1,
  // size: '1024x1024',

  try {
    // const response = await openai.createImageEdit(
    //   fs.createReadStream('./img/Volodya.jpeg'),
    //   fs.createReadStream('./img/Volodya.jpeg'),
    //   // prompt,
    //   'show more haircut options for this person',
    //
    //   // fs.createReadStream(photoUrl),
    //
    //   // fs.createReadStream('mask.png'),
    //
    //   1,
    //   '1024x1024',
    // );
    // image_url = response.data[0].url;

    // console.log(image_url);

    // await bot.sendPhoto(chatId, image_url)

    bot.sendMessage(msg.chat.id, 'Оберіть дію:', optionsOfCustomer)
  } catch (error) {
    console.error('Error:', error)
    bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.')
  }
}

export const BotController = {
  startCommandBot,
  adminSignUp,
  callbackQueryBot,
  messageBot,
  pollingErrorBot,
  contactTelBot,
  photoChangeBot,
}
