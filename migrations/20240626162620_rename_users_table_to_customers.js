exports.up = async function (knex) {
  return knex.schema.renameTable('users', 'customers')
}

exports.down = async function (knex) {
  return knex.schema.renameTable('customers', 'users')
}
