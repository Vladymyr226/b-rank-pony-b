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

  const deals = await botRepository.getDealsRemember()

  if (deals.length) {
    for (const deal of deals) {
      const customers = await botRepository.getCustomerByID({ id: deal.customer_id })
      const salon = await botRepository.getSalonByID({ id: deal.salon_id })
      await bot.sendMessage(
        customers[0].chat_id,
        'Нагадування, завітати до ' +
          salon[0].name +
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
