import { Message, Metadata } from 'node-telegram-bot-api'
import { botRepository } from '../bot.repository'
import { TService } from '../bot.types'
import { optionsOfAdmin, optionsOfCustomer } from '../bot.config'
import { getLogger } from '../../../common/logging'
import getBotInstance from '../../common/bot'
import { userStates } from '../bot.commands'
import { isValidDuration, isValidName, isValidPhoneNumber, isValidTime } from '../../../utils/validation.utils'

const log = getLogger()
const bot = getBotInstance()

export const botMessage = async (msg: Message, metaData: Metadata) => {
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
        if (isValidName(text)) {
          userState.first_name = text
          userState.step = 'phone'
          await bot.sendMessage(chatId, 'Введіть номер телефону')
        } else {
          await bot.sendMessage(chatId, "Ім'я введено неправильно. Спробуйте ще раз.")
        }
        break
      case 'confirm_edit_name':
        if (text.toLowerCase() === 'так') {
          userState.step = 'edit_name'
          await bot.sendMessage(chatId, "Введіть нове ім'я для співробітника")
        } else if (text.toLowerCase() === 'ні') {
          userState.step = 'confirm_edit_phone'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити номер телефону співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Будь ласка, введіть "так" або "ні".')
        }
        break
      case 'edit_name':
        if (isValidName(text)) {
          userState.first_name = text
          userState.step = 'confirm_edit_phone'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити номер телефону співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, "Ім'я введено неправильно. Спробуйте ще раз.")
        }
        break
      case 'confirm_edit_phone':
        if (text.toLowerCase() === 'так') {
          userState.step = 'edit_phone'
          await bot.sendMessage(chatId, 'Введіть новий номер телефону для співробітника')
        } else if (text.toLowerCase() === 'ні') {
          userState.step = 'confirm_edit_work_hour_from'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити часи роботи з (формат ЧЧ:ХХ) співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Будь ласка, введіть "так" або "ні".')
        }
        break
      case 'edit_phone':
        if (isValidPhoneNumber(text)) {
          userState.phone = text
          userState.step = 'confirm_edit_work_hour_from'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити часи роботи з (формат ЧЧ:ХХ) співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Номер введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'phone':
        if (isValidPhoneNumber(text)) {
          userState.phone = text
          userState.step = 'work_hour_from'
          await bot.sendMessage(chatId, 'Працює з (формат ЧЧ:ХХ)')
        } else {
          await bot.sendMessage(chatId, 'Номер введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'confirm_edit_work_hour_from':
        if (text.toLowerCase() === 'так') {
          userState.step = 'edit_work_hour_from'
          await bot.sendMessage(chatId, 'Введіть новий час роботи з (формат ЧЧ:ХХ) для співробітника')
        } else if (text.toLowerCase() === 'ні') {
          userState.step = 'confirm_edit_work_hour_to'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити часи роботи до (формат ЧЧ:ХХ) співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Будь ласка, введіть "так" або "ні".')
        }
        break
      case 'edit_work_hour_from':
        if (isValidTime(text)) {
          userState.work_hour_from = text
          userState.step = 'confirm_edit_work_hour_to'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити часи роботи до (формат ЧЧ:ХХ) співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Час введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'work_hour_from':
        if (isValidTime(text)) {
          userState.work_hour_from = text
          userState.step = 'work_hour_to'
          await bot.sendMessage(chatId, 'Працює до (формат ЧЧ:ХХ)')
        } else {
          await bot.sendMessage(chatId, 'Час введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'work_hour_to':
        if (isValidTime(text)) {
          userState.work_hour_to = text
          userState.step = 'duration'
          await bot.sendMessage(chatId, 'Введіть тривалість послуги (в хвилинах)')
        } else {
          await bot.sendMessage(chatId, 'Час введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'confirm_edit_work_hour_to':
        if (text.toLowerCase() === 'так') {
          userState.step = 'edit_work_hour_to'
          await bot.sendMessage(chatId, 'Введіть новий час роботи до (формат ЧЧ:ХХ) для співробітника')
        } else if (text.toLowerCase() === 'ні') {
          userState.step = 'confirm_edit_duration'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити тривалість роботи співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Будь ласка, введіть "так" або "ні".')
        }
        break
      case 'edit_work_hour_to':
        if (isValidTime(text)) {
          userState.work_hour_to = text
          userState.step = 'confirm_edit_duration'
          await bot.sendMessage(
            chatId,
            'Надішліть "так", щоб змінити тривалість роботи співробітника, або "ні", щоб перейти до наступного кроку.',
          )
        } else {
          await bot.sendMessage(chatId, 'Час введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'price':
        userState.price = +text
        delete userState.step

        try {
          await botRepository.insertService(userState as TService)
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Дані послуги збережені. Дякуємо!')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
        } catch (e) {
          log.error(e)
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
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
      case 'confirm_delete_employee':
        if (text.toLowerCase() === 'так') {
          await botRepository.deleteEmployee(userState.employee_id)
          await bot.sendMessage(chatId, 'Співробітника видалено успішно.')
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
        } else if (text.toLowerCase() === 'ні') {
          await bot.sendMessage(chatId, 'Видалення співробітника скасовано.')
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
        } else {
          await bot.sendMessage(chatId, 'Будь ласка, введіть "так" або "ні".')
        }
        break
      case 'confirm_edit_duration':
        if (text.toLowerCase() === 'так') {
          userState.step = 'edit_duration'
          await bot.sendMessage(chatId, 'Введіть новий час тривалості роботи (в хвилинах) для співробітника')
        } else if (text.toLowerCase() === 'ні') {
          await updateEmployee(userState, chatId)
        } else {
          await bot.sendMessage(chatId, 'Будь ласка, введіть "так" або "ні".')
        }
        break
      case 'edit_duration':
        if (isValidDuration(text)) {
          userState.duration = +text
          await updateEmployee(userState, chatId)
        } else {
          await bot.sendMessage(chatId, 'Тривалість введено неправильно. Спробуйте ще раз.')
        }
        break
      case 'duration':
        if (isValidDuration(text)) {
          userState.duration = +text
        } else {
          await bot.sendMessage(chatId, 'Тривалість введено неправильно. Спробуйте ще раз.')
          break
        }

        const { service_id } = userState
        delete userState.service_id
        delete userState.step

        try {
          const employee = await botRepository.insertEmployee(userState)
          await botRepository.insertEmployeesServices({ employee_id: employee[0].id, service_id })
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Дані співробітника збережено. Дякуємо!')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
        } catch (e) {
          log.error(e)
          delete userStates[chatId]
          await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
          return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
        }
    }
  }
}

const updateEmployee = async (userState, chatId: number) => {
  const id = userState.employee_id
  delete userState.employee_id
  delete userState.step

  try {
    await botRepository.putEmployee(id, userState)
    delete userStates[chatId]
    await bot.sendMessage(chatId, 'Дані співробітника збережено. Дякуємо!')
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
  } catch (e) {
    log.error(e)
    delete userStates[chatId]
    await bot.sendMessage(chatId, 'Виникла помилка. Спробуйте знову.')
    return bot.sendMessage(chatId, 'Оберіть дію:', optionsOfAdmin())
  }
}
