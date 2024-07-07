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

const getCustomerByID = async ({ id, user_tg_id }: { id?: number; user_tg_id?: number }): Promise<Array<TCustomer>> => {
  return db
    .select('*')
    .from('customers')
    .modify((q) => {
      if (id) q.where({ id })
      if (user_tg_id) q.where({ user_tg_id })
    })
    .returning('*')
}

const getAdminByID = async ({
  salon_id,
  user_tg_id,
}: {
  salon_id?: number
  user_tg_id?: number
}): Promise<Array<TAdmin>> => {
  return db
    .select('*')
    .from('admins')
    .modify((q) => {
      if (salon_id) q.where({ salon_id })
      if (user_tg_id) q.where({ user_tg_id })
    })
    .returning('*')
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

const deleteDeal = async (id: number): Promise<Array<TDeal>> => {
  return db('deals').where({ id }).delete()
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
      'deals.id',
      'deals.customer_id',
      'deals.salon_id',
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

const getDealsRemember = async (): Promise<Array<TDeal>> => {
  const utcTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')

  return db
    .select('*')
    .from('deals')
    .whereRaw('EXTRACT(HOUR FROM age(?, calendar_time)) BETWEEN 1 AND 2', [utcTime])
    .returning('*')
}

export const botRepository = {
  getCustomerByID,
  getAdminByID,
  getAdminByTgIDEnable,
  getEmployeeWithServices,
  getDistricts,
  getEmployeesByID,
  getSalonByID,
  getServiceByID,
  getServicesByEmployeeID,
  getDealByID,
  getDealsWithSalon,
  getDealsRemember,
  insertCustomer,
  insertAdmin,
  insertEmployee,
  insertService,
  insertEmployeesServices,
  insertDeal,
  putCustomer,
  deleteDeal,
}
