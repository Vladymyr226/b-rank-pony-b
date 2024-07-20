// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const { PG_CONNECTION_STRING } = process.env

const config = {
  client: 'postgresql',
  connection: PG_CONNECTION_STRING,
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
