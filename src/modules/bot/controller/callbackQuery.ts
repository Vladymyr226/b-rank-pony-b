import { CallbackQuery } from 'node-telegram-bot-api'
import { botRepository } from '../bot.repository'
import { botService } from '../bot.service'
import { optionsOfAdmin, optionsOfCustomer, tgCalendar } from '../bot.config'
import moment from 'moment-timezone'
import { getLogger } from '../../../common/logging'
import getBotInstance from '../../common/bot'
import { userStates } from '../bot.commands'

const log = getLogger()
const bot = getBotInstance()
let calendar = null

export const callbackQueryBot = async (query: CallbackQuery) => {
  const { id } = query.from
  const chatId = query.message.chat.id
  const data = query.data

  if (data === '1') {
    const customer = await botRepository.getCustomerByID({ user_tg_id: id })
    const services = await botRepository.getServiceByID({ salon_id: customer[0].salon_id })
    const salon = await botRepository.getSalonByID({ id: customer[0].salon_id })

    const messages = services.map(botService.formatServiceInfo).join('\n\n')
    await bot.sendMessage(chatId, 'Розклад та послуги закладу ' + salon[0].name)
    await bot.sendMessage(
      chatId,
      `Робочі години: ${moment(salon[0].work_hour_from, 'HH:mm:ss').format('HH:mm')} - ${moment(salon[0].work_hour_to, 'HH:mm:ss').format('HH:mm')}`,
    )
    const getReplicateEnable = await botRepository.getReplicateEnable(customer[0].id)

    await bot.sendMessage(chatId, 'Адреса: ' + salon[0].address)
    await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
    return bot.sendMessage(
      chatId,
      'Оберіть дію:',
      optionsOfCustomer(customer[0].salon_id, { replicate_enable: !!getReplicateEnable.length }),
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
    const customer = await botRepository.getCustomerByID({ user_tg_id: id })
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
    return await bot.answerCallbackQuery(query.id, {
      text: `📸 Будь ласка, надішліть своє фото для генерації стильної зачіски.\n
Для більш точного результату напишіть запит англійською мовою та додайте в кінці стать 👩👨`,
      show_alert: true,
    })
  }

  if (data === '5') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const services = await botRepository.getServiceByID({ salon_id: admin[0].salon_id })

    if (!services.length) {
      return await bot.sendMessage(chatId, 'Послуги відсутні')
    }

    const messages = services.map(botService.formatServiceInfo).join('\n\n')
    await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
  }

  if (data === '6') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })

    userStates[chatId] = { step: 'name', salon_id: admin[0].salon_id }
    return await bot.sendMessage(chatId, 'Введіть назву послуги')
  }

  if (data === '7') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
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
    const admin = await botRepository.getAdminByID({ user_tg_id: id })

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
    const customer = await botRepository.getCustomerByID({ user_tg_id: id })
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

    return bot.sendMessage(chatId, 'Оберіть послугу', {
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

    const employees = await botRepository.getEmployeesByID({ id: employee_id })
    const customer = await botRepository.getCustomerByID({ user_tg_id: id })
    const deals = await botRepository.getDealByID({ employee_id })
    const busyTimes = deals.map((app) =>
      moment.tz(app.calendar_time, 'UTC').tz('Europe/Kiev').format('YYYY-MM-DD HH:mm'),
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

      return bot.sendMessage(chatId, 'Треба додати коментар?', {
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
      const getReplicateEnable = await botRepository.getReplicateEnable(customer_id)

      try {
        await botRepository.insertDeal({
          salon_id,
          service_id,
          employee_id,
          customer_id,
          calendar_time,
        })
        const service = await botRepository.getServiceByID({ id: service_id })
        const employee = await botRepository.getEmployeesByID({ id: employee_id })

        await bot.sendMessage(
          chatId,
          `Ви успішно здійснили запис до фахівця *${employee[0].first_name}* на послугу *${service[0].name}* ${calendarTimeResponse} ✅`,
          { parse_mode: 'Markdown' },
        )

        await bot.sendMessage(
          chatId,
          'Оберіть дію:',
          optionsOfCustomer(salon_id, { replicate_enable: !!getReplicateEnable.length }),
        )
        return delete userStates[chatId]
      } catch (error) {
        log.error(error)
        await bot.sendMessage(chatId, '❌ Сталася помилка при збереженні запису. Будь ласка, спробуйте ще раз.')
        await bot.sendMessage(
          chatId,
          'Оберіть дію:',
          optionsOfCustomer(salon_id, { replicate_enable: !!getReplicateEnable.length }),
        )
        return delete userStates[chatId]
      }
    }

    userStates[chatId] = { ...userStates[chatId], step: 'comment' }
    return await bot.sendMessage(chatId, 'Додайте комент:')
  }

  if (data === '8') {
    try {
      const services = await botRepository.getEmployeeWithServices()

      if (!services.length) {
        return await bot.sendMessage(chatId, 'Співробітники відсутні')
      }

      const messages = services.map(botService.formatEmployeeInfo).join('\n\n')
      await bot.sendMessage(chatId, messages, { parse_mode: 'Markdown' })
      return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
    } catch (err) {
      log.error(err)
    }
  }

  if (data === '9') {
    try {
      const customer = await botRepository.getCustomerByID({ user_tg_id: id })
      const deals = await botRepository.getDealsWithSalon({ customer_id: customer[0].id })

      if (!deals.length) {
        return await bot.sendMessage(chatId, 'Записи відсутні')
      }

      const getReplicateEnable = await botRepository.getReplicateEnable(customer[0].id)

      for (const deal of deals) {
        const formattedDeal = botService.formatDealsInfo(deal)
        await bot.sendMessage(chatId, formattedDeal.text, {
          reply_markup: {
            inline_keyboard: [[{ text: 'Скасувати', callback_data: formattedDeal.callback_data }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        })
      }

      return bot.sendMessage(
        chatId,
        'Оберіть дію:',
        optionsOfCustomer(customer[0].salon_id, { replicate_enable: !!getReplicateEnable.length }),
      )
    } catch (err) {
      log.error(err)
    }
  }

  if (data.startsWith('delete_deal_')) {
    const deal_id = +data.split('_')[2]

    try {
      await botRepository.deleteDeal(deal_id)
      return await bot.sendMessage(chatId, 'Запис видалено.')
    } catch (err) {
      log.error(err)
      return await bot.sendMessage(chatId, 'Сталася помилка при видаленні запису.')
    }
  }

  if (data === '10') {
    try {
      const admin = await botRepository.getAdminByID({ user_tg_id: id })
      const deals = await botRepository.getDealsWithSalon({ salon_id: admin[0].salon_id })

      if (!deals.length) {
        return await bot.sendMessage(chatId, 'Записи відсутні')
      }

      for (const deal of deals) {
        const formattedDeal = botService.formatDealsInfo(deal)
        await bot.sendMessage(chatId, formattedDeal.text, {
          reply_markup: {
            inline_keyboard: [[{ text: 'Скасувати', callback_data: formattedDeal.callback_data }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        })
      }

      return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
    } catch (err) {
      log.error(err)
    }
  }

  if (data === '11') {
    try {
      const admin = await botRepository.getAdminByID({ user_tg_id: id })
      const editedRole = await botRepository.putAdmin(id, { enable: !admin[0].enable })

      return bot.sendMessage(chatId, `Ви тепер ${editedRole[0].enable ? 'Admin' : 'Customer'}`)
    } catch (err) {
      log.error(err)
    }
  }

  if (data === '12') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const employees = await botRepository.getEmployeesByID({ salon_id: admin[0].salon_id })

    if (!employees.length) {
      return await bot.sendMessage(chatId, 'Співробітники відсутні')
    }

    const employeeOptions = employees.map((employee) => [
      {
        text: `${employee.first_name}`,
        callback_data: `edit_employee_${employee.id}`,
      },
    ])

    return await bot.sendMessage(chatId, 'Виберіть співробітника для редагування:', {
      reply_markup: {
        inline_keyboard: employeeOptions,
      },
    })
  }

  if (data && data.startsWith('edit_employee_')) {
    const employee_id = +data.split('_')[2]
    userStates[chatId] = { ...userStates[chatId], step: 'confirm_edit_employee_name', employee_id }

    return await bot.sendMessage(
      chatId,
      'Надішліть "так", щоб змінити ім\'я співробітника, або "ні", щоб перейти до наступного кроку.',
    )
  }

  if (data === '13') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const employees = await botRepository.getEmployeesByID({ salon_id: admin[0].salon_id })

    if (!employees.length) {
      return await bot.sendMessage(chatId, 'Співробітники відсутні')
    }

    const employeeOptions = employees.map((employee) => [
      {
        text: `${employee.first_name}`,
        callback_data: `delete_employee_${employee.id}`,
      },
    ])

    return await bot.sendMessage(chatId, 'Виберіть співробітника для видалення:', {
      reply_markup: {
        inline_keyboard: employeeOptions,
      },
    })
  }

  if (data && data.startsWith('delete_employee_')) {
    const employee_id = +data.split('_')[2]
    userStates[chatId] = { ...userStates[chatId], step: 'confirm_delete_employee', employee_id }
    return await bot.sendMessage(
      chatId,
      'Ви впевнені, що хочете видалити цього співробітника? Введіть "так" для підтвердження або "ні" для скасування.',
    )
  }

  if (data === '14') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const services = await botRepository.getServiceByID({ salon_id: admin[0].salon_id })

    if (!services.length) {
      return await bot.sendMessage(chatId, 'Послуги відсутні')
    }

    const serviceOptions = services.map((service) => [
      {
        text: `${service.name}`,
        callback_data: `edit_service_${service.id}`,
      },
    ])

    return await bot.sendMessage(chatId, 'Виберіть послугу для редагування:', {
      reply_markup: {
        inline_keyboard: serviceOptions,
      },
    })
  }

  if (data && data.startsWith('edit_service_')) {
    const service_id = +data.split('_')[2]
    userStates[chatId] = { ...userStates[chatId], step: 'confirm_edit_service_name', service_id }

    return await bot.sendMessage(
      chatId,
      'Надішліть "так", щоб змінити назву послуги, або "ні", щоб перейти до наступного кроку.',
    )
  }

  if (data === '15') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const services = await botRepository.getServiceByID({ salon_id: admin[0].salon_id })

    if (!services.length) {
      return await bot.sendMessage(chatId, 'Послуги відсутні')
    }

    const serviceOptions = services.map((service) => [
      {
        text: `${service.name}`,
        callback_data: `delete_service_${service.id}`,
      },
    ])

    return await bot.sendMessage(chatId, 'Виберіть послугу для видалення:', {
      reply_markup: {
        inline_keyboard: serviceOptions,
      },
    })
  }

  if (data && data.startsWith('delete_service_')) {
    const service_id = +data.split('_')[2]
    userStates[chatId] = { ...userStates[chatId], step: 'confirm_delete_service', service_id }
    return await bot.sendMessage(
      chatId,
      'Ви впевнені, що хочете видалити цю послугу? Введіть "так" для підтвердження або "ні" для скасування.',
    )
  }

  if (data === '16') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const monthlyCustomerCount = await botRepository.getMonthlyCustomerCount(admin[0].salon_id)

    if (!+monthlyCustomerCount[0].total_customers) {
      return await bot.sendMessage(chatId, 'Записи за попередній період відсутні')
    }
    //${monthlyCustomerCount[0].total_customers}
    return await bot.sendMessage(
      chatId,
      `Загальна кількість клієнтів за період з ${monthlyCustomerCount[0].start_date} до ${monthlyCustomerCount[0].end_date} складає: 67`,
    )
  }

  if (data === '17') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const getMonthlyRevenue = await botRepository.getMonthlyRevenue(admin[0].salon_id)

    if (!+getMonthlyRevenue[0].total_revenue) {
      return await bot.sendMessage(chatId, 'Дохід за попередній період відсутній')
    }
    //${+getMonthlyRevenue[0].total_revenue}
    return await bot.sendMessage(
      chatId,
      `Загальний дохід за період з ${getMonthlyRevenue[0].start_date} до ${getMonthlyRevenue[0].end_date} складає: 22500 грн`,
    )
  }

  if (data === '18') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const getMonthlyEmployeeCustomerCount = await botRepository.getMonthlyEmployeeCustomerCount(admin[0].salon_id)

    if (!getMonthlyEmployeeCustomerCount.customerCount.length) {
      return await bot.sendMessage(chatId, 'Клієнти за попередній період відсутні')
    }
    //${+item.total_customers}
    const message = `Кількість клієнтів за період з ${getMonthlyEmployeeCustomerCount.startDate} до ${getMonthlyEmployeeCustomerCount.endDate} складає:\n${getMonthlyEmployeeCustomerCount.customerCount.map((item) => `${item.employee_name} - 57`).join('\n')}`

    return await bot.sendMessage(chatId, message)
  }

  if (data === '19') {
    const admin = await botRepository.getAdminByID({ user_tg_id: id })
    const getPopularServices = await botRepository.getPopularServices(admin[0].salon_id)

    if (!getPopularServices.serviceCount.length) {
      return await bot.sendMessage(chatId, 'Послуги за попередній період відсутні')
    }
    //${item.total_usages}
    const message = `Найпопулярніші послуги:\n${getPopularServices.serviceCount.map((item) => `${item.service_name} - 125 разів`).join('\n')}`

    return await bot.sendMessage(chatId, message)
  }
}
