import { CallbackQuery, Message, Metadata } from 'node-telegram-bot-api'
import { tgCalendar, optionsOfCustomer, optionsOfAdmin } from './bot.config'
import getBotInstance from '../common/bot'
import { getLogger } from '../../common/logging'
import { botRepository } from './bot.repository'
import { TAdditionalType, TDeal, TEmployee, TService } from './bot.types'
import { botService } from './bot.service'
import moment from 'moment-timezone'

const log = getLogger()
const bot = getBotInstance()
const userStates: Record<number, TEmployee & Partial<TService & TDeal> & TAdditionalType> = {}
let calendar = null

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
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(isCustomerByTgID[0].salon_id))
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
  return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer[0].salon_id))
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

  const isHasSalon = await botRepository.getSalonByID({ id: salon_id })

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
      case 'work_hour_to':
        userState.work_hour_to = text
        userState.step = 'duration'
        await bot.sendMessage(chatId, 'Введіть тривалість послуги (в хвилинах)')
        break
      case 'price':
        userState.price = +text
        delete userState.step

        try {
          await botRepository.insertService(userState as TService)
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Дані послуги збережені. Дякуємо!')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        } catch (e) {
          log.error(e)
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        }
      case 'comment':
        const {
          salon_id,
          service_id: serviceId,
          employee_id,
          customer_id,
          calendar_time,
          calendarTimeResponse,
        } = userStates[chatId] || {}
        try {
          await botRepository.insertDeal({
            salon_id,
            service_id: serviceId,
            employee_id,
            customer_id,
            notes: text,
            calendar_time,
          })
          await bot.sendMessage(chatId, '✅ Ви успішно здійснили запис до фахівця: ' + calendarTimeResponse)
          await bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer_id))
          return delete userStates[chatId]
        } catch (error) {
          log.error(error)
          await bot.sendMessage(chatId, '❌ Сталася помилка при збереженні запису. Будь ласка, спробуйте ще раз.')
          await bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer_id))
          return delete userStates[chatId]
        }
      case 'duration':
        userState.duration = +text
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
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
        }
    }
  }
}

const callbackQueryBot = async (query: CallbackQuery) => {
  const { id } = query.from
  const chatId = query.message.chat.id
  const data = query.data

  if (data === '1') {
    const customer = await botRepository.getCustomerByTgID(id)
    const services = await botRepository.getServiceByID({ salon_id: customer[0].salon_id })
    const salon = await botRepository.getSalonByID({ id: customer[0].salon_id })

    const messages = services.map(botService.formatServiceInfo).join('\n\n')
    await bot.sendMessage(chatId, 'Послуги закладу ' + salon[0].name)
    await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer[0].salon_id))
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
    const customer = await botRepository.getCustomerByTgID(id)
    if (customer[0].salon_id) {
      const employees = await botRepository.getEmployeesByID({ salon_id: customer[0].salon_id })

      await bot.sendMessage(chatId, 'Оберіть фахівця:', {
        reply_markup: {
          inline_keyboard: employees.map((item) => [{ text: item.first_name, callback_data: `employee_${item.id}` }]),
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })
      return bot.sendMessage(chatId, 'Обрати інший заклад', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Обрати інший заклад', callback_data: `change_salon` }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })
    }

    const districts = await botRepository.getDistricts()

    return bot.sendMessage(chatId, 'Оберіть район:', {
      reply_markup: {
        inline_keyboard: districts.map((item) => [{ text: item.name, callback_data: `district_${item.id}` }]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data === '4') {
    return bot.sendMessage(chatId, 'Будь ласка, надішліть своє фото для генерації стильної зачіски.')
  }

  if (data === '5') {
    const admin = await botRepository.getAdminByTgID(id)
    const services = await botRepository.getServiceByID({ salon_id: admin[0].salon_id })

    const messages = services.map(botService.formatServiceInfo).join('\n\n')
    await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
  }

  if (data === '6') {
    const admin = await botRepository.getAdminByTgID(id)

    userStates[chatId] = { step: 'name', salon_id: admin[0].salon_id }
    return await bot.sendMessage(chatId, 'Введіть назву послуги')
  }

  if (data === '7') {
    const admin = await botRepository.getAdminByTgID(id)
    const services = await botRepository.getServiceByID({ salon_id: admin[0].salon_id })

    return bot.sendMessage(chatId, 'Оберіть позицію:', {
      reply_markup: {
        inline_keyboard: services.map((item) => [{ text: item.name, callback_data: `new-service_${item.id}` }]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data.startsWith('new-service_')) {
    const service_id = +data.split('_')[1]
    const admin = await botRepository.getAdminByTgID(id)

    userStates[chatId] = { step: 'first_name', salon_id: admin[0].salon_id, service_id }
    return await bot.sendMessage(chatId, "Введіть ім'я")
  }

  if (data.startsWith('district_')) {
    const district_id = +data.split('_')[1]
    const salons = await botRepository.getSalonByID({ district_id })

    return bot.sendMessage(chatId, salons.length ? 'Оберіть заклад:' : 'Нажаль, поки відсутні заклади в цьому районі', {
      reply_markup: {
        inline_keyboard: salons.map((item) => [{ text: item.name, callback_data: `salon_${item.id}` }]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data.startsWith('salon_')) {
    const salon_id = +data.split('_')[1]
    const customer = await botRepository.getCustomerByTgID(id)
    if (!customer[0].salon_id) await botRepository.putCustomer(id, { salon_id })

    const employees = await botRepository.getEmployeesByID({ salon_id })

    await bot.sendMessage(chatId, 'Оберіть фахівця:', {
      reply_markup: {
        inline_keyboard: employees.map((item) => [{ text: item.first_name, callback_data: `employee_${item.id}` }]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
    return bot.sendMessage(chatId, 'Обрати інший заклад', {
      reply_markup: {
        inline_keyboard: [[{ text: 'Обрати інший заклад', callback_data: `change_salon` }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data === 'change_salon') {
    await botRepository.putCustomer(id, { salon_id: null })
    const districts = await botRepository.getDistricts()

    return bot.sendMessage(chatId, 'Оберіть район:', {
      reply_markup: {
        inline_keyboard: districts.map((item) => [{ text: item.name, callback_data: `district_${item.id}` }]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data.startsWith('employee_')) {
    const employee_id = +data.split('_')[1]
    const service = await botRepository.getServicesByEmployeeID(employee_id)

    return bot.sendMessage(chatId, 'Оберіть послугу:', {
      reply_markup: {
        inline_keyboard: service.map((item) => [
          { text: item.name, callback_data: `service_${item.id}_${employee_id}` },
        ]),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data.startsWith('service_')) {
    const service_id = +data.split('_')[1]
    const employee_id = +data.split('_')[2]

    const services = await botRepository.getServiceByID({ id: service_id })
    const employees = await botRepository.getEmployeesByID({ id: employee_id })
    const customer = await botRepository.getCustomerByTgID(id)
    const deals = await botRepository.getDealByID({ employee_id })
    const busyTimes = deals.map((app) =>
      moment.tz(app.calendar_time, 'UTC').tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm'),
    )

    const { work_hour_from, work_hour_to, salon_id, duration } = employees[0]

    userStates[chatId] = {
      ...userStates[chatId],
      salon_id,
      service_id,
      employee_id,
      customer_id: customer[0].id,
      work_hour_from,
      work_hour_to,
      duration,
    }

    calendar = tgCalendar(bot, work_hour_from, work_hour_to, duration, busyTimes)
    return calendar.startNavCalendar(query.message)
  }

  const { work_hour_from, work_hour_to, duration, salon_id, service_id, employee_id, customer_id } =
    userStates[chatId] || {}

  if (work_hour_from && work_hour_to && duration) {
    const calendarTimeResponse = calendar.clickButtonCalendar(query)

    if (calendarTimeResponse !== -1) {
      const utcTime = moment.tz(calendarTimeResponse, 'DD-MM-YYYY HH:mm', 'Europe/Kiev').utc().format()
      const formattedUtcTime = `${utcTime.slice(0, 16)}:00Z`

      userStates[chatId] = {
        ...userStates[chatId],
        calendar_time: formattedUtcTime,
        calendarTimeResponse,
      }

      return bot.sendMessage(chatId, 'Чи треба додати коментар?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Так', callback_data: `comment_1` }],
            [{ text: 'Ні', callback_data: `comment_2` }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })
    }
  }

  if (data.startsWith('comment_')) {
    const comment_id = +data.split('_')[1]

    const { calendar_time, calendarTimeResponse } = userStates[chatId] || {}

    if (comment_id === 2) {
      try {
        await botRepository.insertDeal({
          salon_id,
          service_id,
          employee_id,
          customer_id,
          calendar_time,
        })
        await bot.sendMessage(chatId, '✅ Ви успішно здійснили запис до фахівця: ' + calendarTimeResponse)
        await bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer_id))
        return delete userStates[chatId]
      } catch (error) {
        log.error(error)
        await bot.sendMessage(chatId, '❌ Сталася помилка при збереженні запису. Будь ласка, спробуйте ще раз.')
        await bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer_id))
        return delete userStates[chatId]
      }
    }

    userStates[chatId] = { ...userStates[chatId], step: 'comment' }
    return await bot.sendMessage(chatId, 'Додайте комент:')
  }

  if (data === '8') {
    try {
      const services = await botRepository.getEmployeeWithServices()

      const messages = services.map(botService.formatEmployeeInfo).join('\n\n')
      await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
      return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin)
    } catch (err) {
      log.error(err)
    }
  }

  if (data === '9') {
    try {
      const customer = await botRepository.getCustomerByTgID(id)
      const deals = await botRepository.getDealsWithSalon({ customer_id: customer[0].id })

      const messages = deals.map(botService.formatDealsInfo).join('\n\n')
      await bot.sendMessage(chatId, messages)
      return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfCustomer(customer[0].salon_id))
    } catch (err) {
      log.error(err)
    }
  }

  if (data === '10') {
    try {
      const admin = await botRepository.getAdminByTgID(id)
      const deals = await botRepository.getDealsWithSalon({ salon_id: admin[0].salon_id })

      const messages = deals.map(botService.formatDealsInfo).join('\n\n')
      await bot.sendMessage(chatId, messages)
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
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', optionsOfCustomer(1))
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

    bot.sendMessage(msg.chat.id, 'Оберіть дію:', optionsOfCustomer(1))
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
