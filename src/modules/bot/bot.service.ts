import { TEmployeeWithServiceName, TService } from './bot.types'

const formatEmployeeInfo = (employee: TEmployeeWithServiceName) => {
  return `*Ім'я:* ${employee.first_name}
*Телефон:* ${employee.phone}
*Робочі години:* ${employee.work_hour_from} - ${employee.work_hour_to}
*Послуги:* ${employee.services.join(', ')}`
}

const formatServiceInfo = (service: TService, index: number) => {
  return `${index + 1}. "${service.name}" - ${service.description} - *${service.price} грн*`
}

export const botService = {
  formatEmployeeInfo,
  formatServiceInfo,
}
