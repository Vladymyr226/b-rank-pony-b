import { IUserDB } from './users.types.js';
import { db } from '../../../common/db/knex.js';

const getUserByEmailName = async (email: string, user_name?: string): Promise<Array<IUserDB>> => {
  return db
    .select('*')
    .from('users')
    .modify((q) => {
      q.where({ email });
      if (user_name) q.where({ user_name });
    })
    .returning('*');
};

const insertUser = async (data: IUserDB): Promise<Array<IUserDB>> => {
  return db('users').insert(data).returning('*');
};

const getUserById = async (id: number): Promise<Array<IUserDB>> => {
  return db.select('*').from('users').where({ id }).returning('*');
};

export const usersRepository = {
  getUserByEmailName,
  insertUser,
  getUserById,
};
