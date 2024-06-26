import { db } from '../../common/db/knexKonfig'
import { TAdmin, TCustomer, TSalon } from './bot.types'

const getCustomerByTgID = async (user_tg_id: number): Promise<Array<TCustomer>> => {
  return db.select('*').from('customers').where({ user_tg_id }).returning('*')
}

const getAdminByTgID = async (user_tg_id: number): Promise<Array<TCustomer>> => {
  return db.select('*').from('admins').where({ user_tg_id, enable: true }).returning('*')
}

const insertCustomer = async (data: TCustomer): Promise<Array<TCustomer>> => {
  return db('customers').insert(data).returning('*')
}

const insertAdmin = async (data: TAdmin): Promise<Array<TAdmin>> => {
  return db('admins').insert(data).returning('*')
}

const getSalonByID = async (id: number): Promise<Array<TSalon>> => {
  return db.select('*').from('salon').where({ id }).returning('*')
}

export const botRepository = {
  getCustomerByTgID,
  getAdminByTgID,
  insertCustomer,
  getSalonByID,
  insertAdmin,
}
