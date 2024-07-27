exports.up = async function (knex) {
  return knex.schema.alterTable('salon', (table) => {
    table.boolean('replicate_enable').defaultTo(true)
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('salon', (table) => {
    table.dropColumn('replicate_enable')
  })
}
