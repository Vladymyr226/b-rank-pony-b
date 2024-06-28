exports.up = async function (knex) {
  return knex.schema.alterTable('customers', function (table) {
    table.integer('salon_id').nullable().alter()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('customers', function (table) {
    table.integer('salon_id').notNullable().alter()
  })
}
