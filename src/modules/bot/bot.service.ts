import { TEmployeeWithServiceName, TService } from './bot.types'
import moment from 'moment-timezone'
import { botRepository } from './bot.repository'
import getBotInstance from '../common/bot'
const bot = getBotInstance()

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
  console.log('Running a task every hour')
  const currentDateUTC = moment().utc().format('YYYY-MM-DD HH:mm:ss')
  const deals = await botRepository.getDealsRemember()

  console.log(333333333, deals)

  const temp = await botRepository.getDealsWithSalon({})

  console.log(4444444444, temp, currentDateUTC)

  const filteredDeals = temp.filter((appointment) => {
    const appointmentTime = moment.utc(appointment.calendar_time)
    const diffInHours = appointmentTime.diff(currentDateUTC, 'hours', true) // 'true' для получения дробного значения
    console.log('appointmentTime', appointmentTime, diffInHours)

    return diffInHours > 1 && diffInHours < 2
  })

  console.log(555555555555, filteredDeals)

  if (deals.length) {
    for (const deal of filteredDeals) {
      const customers = await botRepository.getCustomerByID({ id: deal.customer_id })
      console.log(6666666666, customers[0].chat_id)
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
