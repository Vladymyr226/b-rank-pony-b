import knex, { Knex } from 'knex'

const { DATABASE_URL } = process.env

export const getKnexConfig = () => ({
  client: 'pg',
  connection: {
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    tableName: 'migrations',
    extension: 'js',
  },
})

export const db: Knex = knex(getKnexConfig())
