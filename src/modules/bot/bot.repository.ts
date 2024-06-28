import { db } from '../../common/db/knexKonfig'
import {
  TAdmin,
  TCustomer,
  TEmployee,
  TEmployeesServices,
  TEmployeeWithServiceName,
  TSalon,
  TService,
} from './bot.types'

const getCustomerByTgID = async (user_tg_id: number): Promise<Array<TCustomer>> => {
  return db.select('*').from('customers').where({ user_tg_id }).returning('*')
}

const getAdminByTgID = async (user_tg_id: number): Promise<Array<TAdmin>> => {
  return db.select('*').from('admins').where({ user_tg_id }).returning('*')
}

const getAdminByTgIDEnable = async (user_tg_id: number): Promise<Array<TAdmin>> => {
  return db.select('*').from('admins').where({ user_tg_id, enable: true }).returning('*')
}

const getSalonByID = async (id: number): Promise<Array<TSalon>> => {
  return db.select('*').from('salon').where({ id }).returning('*')
}

const getServiceBySalonID = async (salon_id: number): Promise<Array<TService>> => {
  return db.select('*').from('services').where({ salon_id }).returning('*')
}

const insertCustomer = async (data: TCustomer): Promise<Array<TCustomer>> => {
  return db('customers').insert(data).returning('*')
}

const insertAdmin = async (data: TAdmin): Promise<Array<TAdmin>> => {
  return db('admins').insert(data).returning('*')
}

const insertEmployee = async (data: TEmployee): Promise<Array<TEmployee>> => {
  return db('employees').insert(data).returning('*')
}

const insertService = async (data: TService): Promise<Array<TService>> => {
  return db('services').insert(data).returning('*')
}

const insertEmployeesServices = async (data: TEmployeesServices): Promise<Array<TEmployeesServices>> => {
  return db('employees_services').insert(data).returning('*')
}

const getEmployeeWithServices = async (): Promise<Array<TEmployeeWithServiceName>> => {
  const employees = await db.select('*').from('employees')

  const employeesWithServices = await Promise.all(
    employees.map(async (employee) => {
      const services = await db
        .select('services.name')
        .from('employees_services')
        .innerJoin('services', 'employees_services.service_id', 'services.id')
        .where('employees_services.employee_id', employee.id)

      return {
        ...employee,
        services: services.map((service) => service.name),
      }
    }),
  )

  return employeesWithServices
}

export const botRepository = {
  getCustomerByTgID,
  getAdminByTgID,
  getAdminByTgIDEnable,
  getEmployeeWithServices,
  insertCustomer,
  getSalonByID,
  getServiceBySalonID,
  insertAdmin,
  insertEmployee,
  insertService,
  insertEmployeesServices,
}
