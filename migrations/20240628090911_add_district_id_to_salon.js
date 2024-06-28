exports.up = async function (knex) {
  return knex.schema.alterTable('salon', (table) => {
    table.integer('district_id').references('districts.id')
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('salon', (table) => {
    table.dropColumn('district_id')
  })
}
