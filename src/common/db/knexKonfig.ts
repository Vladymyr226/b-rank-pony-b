import knex, { Knex } from 'knex'

const { PG_CONNECTION_STRING } = process.env

export const getKnexConfig = () => ({
  client: 'pg',
  connection: PG_CONNECTION_STRING,
  migrations: {
    tableName: 'migrations',
    extension: 'js',
  },
})

export const db: Knex = knex(getKnexConfig())
