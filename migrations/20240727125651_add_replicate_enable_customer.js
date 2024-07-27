exports.up = async function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.boolean('replicate_enable').defaultTo(true)
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.dropColumn('replicate_enable')
  })
}
