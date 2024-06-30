import { db } from '../../common/db/knexKonfig'
import {
  TAdmin,
  TCustomer,
  TDeal,
  TDistrict,
  TEmployee,
  TEmployeesServices,
  TEmployeeWithServiceName,
  TSalon,
  TService,
} from './bot.types'
import moment from 'moment-timezone'

const getCustomerByTgID = async (user_tg_id: number): Promise<Array<TCustomer>> => {
  return db.select('*').from('customers').where({ user_tg_id }).returning('*')
}

const getAdminByTgID = async (user_tg_id: number): Promise<Array<TAdmin>> => {
  return db.select('*').from('admins').where({ user_tg_id }).returning('*')
}

const getAdminByTgIDEnable = async (user_tg_id: number): Promise<Array<TAdmin>> => {
  return db.select('*').from('admins').where({ user_tg_id, enable: true }).returning('*')
}

const getSalonByID = async ({ id, district_id }: { id?: number; district_id?: number }): Promise<Array<TSalon>> => {
  return db
    .select('*')
    .from('salon')
    .modify((q) => {
      if (id) q.where({ id })
      if (district_id) q.where({ district_id })
    })
    .returning('*')
}

const getServiceByID = async ({ id, salon_id }: { id?: number; salon_id?: number }): Promise<Array<TService>> => {
  return db
    .select('*')
    .from('services')
    .modify((q) => {
      if (id) q.where({ id })
      if (salon_id) q.where({ salon_id })
    })
    .returning('*')
}

const getDistricts = async (): Promise<Array<TDistrict>> => {
  return db.select('*').from('districts').returning('*')
}

const getEmployeesByID = async ({ id, salon_id }: { id?: number; salon_id?: number }): Promise<Array<TEmployee>> => {
  return db
    .select('*')
    .from('employees')
    .modify((q) => {
      if (id) q.where({ id })
      if (salon_id) q.where({ salon_id })
    })
    .returning('*')
}

const getServicesByEmployeeID = async (employee_id: number): Promise<Array<TService>> => {
  return db('employees_services as es')
    .select('*')
    .innerJoin('services as s', 'es.service_id', 's.id')
    .where('es.employee_id', employee_id)
    .returning('*')
}

const getDealByID = async ({
  id,
  employee_id,
  salon_id,
  customer_id,
}: {
  id?: number
  employee_id?: number
  salon_id?: number
  customer_id?: number
}): Promise<Array<TDeal>> => {
  return db
    .select('*')
    .from('deals')
    .modify((q) => {
      if (id) q.where({ id })
      if (employee_id) q.where({ employee_id })
      if (salon_id) q.where({ salon_id })
      if (customer_id) q.where({ customer_id })
    })
    .returning('*')
}

const insertCustomer = async (data: TCustomer): Promise<Array<TCustomer>> => {
  return db('customers').insert(data).returning('*')
}

const putCustomer = async (user_tg_id: number, data: Partial<TCustomer>): Promise<Array<TCustomer>> => {
  return db('customers').update(data).where({ user_tg_id }).returning('*')
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

const insertDeal = async (data: TDeal): Promise<Array<TDeal>> => {
  return db('deals').insert(data).returning('*')
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

const getDealsWithSalon = async ({
  customer_id,
  salon_id,
}: {
  customer_id?: number
  salon_id?: number
}): Promise<Array<any>> => {
  const currentDateUTC = moment().utc().format('YYYY-MM-DD HH:mm:ss')

  return db('deals')
    .select(
      'deals.calendar_time',
      'deals.notes',
      'salon.name as salon_name',
      'services.name as service_name',
      'employees.first_name as employee_name',
    )
    .join('salon', 'deals.salon_id', 'salon.id')
    .join('services', 'deals.service_id', 'services.id')
    .join('employees', 'deals.employee_id', 'employees.id')
    .modify((q) => {
      if (salon_id) q.where('deals.salon_id', salon_id)
      if (customer_id) q.where('deals.customer_id', customer_id)
    })
    .andWhere('deals.calendar_time', '>', currentDateUTC)
    .orderBy('deals.calendar_time', 'asc')
    .returning('*')
}

export const botRepository = {
  getCustomerByTgID,
  getAdminByTgID,
  getAdminByTgIDEnable,
  getEmployeeWithServices,
  getDistricts,
  getEmployeesByID,
  getSalonByID,
  getServiceByID,
  getServicesByEmployeeID,
  getDealByID,
  getDealsWithSalon,
  insertCustomer,
  insertAdmin,
  insertEmployee,
  insertService,
  insertEmployeesServices,
  insertDeal,
  putCustomer,
}
