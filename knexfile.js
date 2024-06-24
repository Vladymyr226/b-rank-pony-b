require('dotenv').config()

const { POSTGRES_URL } = process.env

const config = {
  client: 'postgresql',
  connection: POSTGRES_URL,
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
