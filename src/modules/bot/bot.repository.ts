import { db } from '../../common/db/knexKonfig'
import { TUser } from './bot.types'

const getUserByTgID = async (user_tg_id: number): Promise<Array<TUser>> => {
  return db.select('*').from('users').where({ user_tg_id }).returning('*')
}

const insertUser = async (data: TUser): Promise<Array<TUser>> => {
  return db('users').insert(data).returning('*')
}

export const botRepository = {
  getUserByTgID,
  insertUser,
}
