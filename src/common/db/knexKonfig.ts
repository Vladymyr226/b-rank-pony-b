import knex, { Knex } from 'knex'

const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, DATABASE_URL } = process.env

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
