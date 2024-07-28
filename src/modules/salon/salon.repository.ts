import { db } from '../../common/db/knexKonfig'
import { TOrder } from './salon.type'

const insertOrder = async (data: TOrder): Promise<Array<TOrder>> => {
  return db('orders').insert(data).returning('*')
}

export const salonRepository = {
  insertOrder,
}
