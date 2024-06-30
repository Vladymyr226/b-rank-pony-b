exports.up = async function (knex) {
  return knex.schema.alterTable('services', (table) => {
    table.dropColumn('duration')
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('services', (table) => {
    table.integer('duration').nullable()
  })
}
