import { TEmployeeWithServiceName, TService } from './bot.types'
import moment from 'moment-timezone'

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
  calendar_time: Date
  salon_name: string
  service_name: string
  employee_name: string
  notes?: string
}) => {
  return `- Послуга: ${data.service_name}
- Заклад: ${data.salon_name}
- Фахівець: ${data.employee_name}
- Час: ${moment.tz(data.calendar_time, 'UTC').tz(moment.tz.guess()).format('DD-MM-YYYY HH:mm')} ${data.notes ? `\n- Нотатки: ${data.notes}` : ''}`
}

export const botService = {
  formatEmployeeInfo,
  formatServiceInfo,
  formatDealsInfo,
}
