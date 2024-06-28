exports.up = async function (knex) {
  return knex.schema.alterTable('employees', (table) => {
    table.dropColumn('service_id')
  })
}

exports.down = async function (knex) {
  return null
}
