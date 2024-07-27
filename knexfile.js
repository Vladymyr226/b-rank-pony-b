// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const { DATABASE_URL } = process.env

const config = {
  client: 'postgresql',
  connection: {
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'migrations',
    extension: 'js',
  },
}

module.exports = {
  ...config,
}
