exports.up = async function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.integer('salon_id').references('salon.id').notNullable().defaultTo(1)
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.dropColumn('salon_id')
  })
}
