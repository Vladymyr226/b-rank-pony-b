import { TEmployeeWithServiceName, TService } from './bot.types'
import moment from 'moment-timezone'
import { botRepository } from './bot.repository'
import getBotInstance from '../common/bot'
import { getLogger } from '../../common/logging'
const bot = getBotInstance()
const log = getLogger()

const formatEmployeeInfo = (employee: TEmployeeWithServiceName) => {
  return `*Ім'я:* ${employee.first_name}
*Телефон:* ${employee.phone}
*Робочі години:* ${employee.work_hour_from} - ${employee.work_hour_to}
*Послуги:* ${employee.services.join(', ')}`
}

const formatServiceInfo = (service: TService, index: number) => {
  return `${index + 1}. "${service.name}" - ${service.description} - *${service.price} грн*`
}

const formatDealsInfo = (data: {
  id: number
  calendar_time: Date
  salon_name: string
  service_name: string
  employee_name: string
  notes?: string
}) => {
  const formattedTime = moment.tz(data.calendar_time, 'UTC').tz('Europe/Kiev').format('DD-MM-YYYY HH:mm')
  const notes = data.notes ? `\n- Нотатки: ${data.notes}` : ''

  return {
    text: `- Послуга: ${data.service_name}
- Заклад: ${data.salon_name}
- Фахівець: ${data.employee_name}
- Час: ${formattedTime}${notes}`,
    callback_data: `delete_deal_${data.id}`,
  }
}

const cronJobReminder = async () => {
  log.info('Running a task every hour')
  const currentDateUTC = moment().utc()
  const deals = await botRepository.getDealsWithSalon({})

  const filteredDeals = deals.filter((appointment) => {
    const appointmentTime = moment.utc(appointment.calendar_time)
    const minutes = appointmentTime.diff(currentDateUTC, 'minutes', true) // 'true' для получения дробного значения

    const diffInMinutes = Math.round(minutes)
    return diffInMinutes >= 60 && diffInMinutes < 120
  })

  if (filteredDeals.length) {
    for (const deal of filteredDeals) {
      const customers = await botRepository.getCustomerByID({ id: deal.customer_id })
      await bot.sendMessage(
        customers[0].chat_id,
        'Нагадування, про попередній запис до ' +
          deal.salon_name +
          ' о ' +
          moment.tz(deal.calendar_time, 'UTC').tz('Europe/Kiev').format('HH:mm DD-MM-YYYY'),
      )
    }
  }
}

export const botService = {
  formatEmployeeInfo,
  formatServiceInfo,
  formatDealsInfo,
  cronJobReminder,
}
