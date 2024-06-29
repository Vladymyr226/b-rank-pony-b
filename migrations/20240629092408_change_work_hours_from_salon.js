exports.up = async function (knex) {
  return knex.schema.alterTable('salon', function (table) {
    table.dropColumn('opening_hours')
    table.time('work_hour_from').nullable()
    table.time('work_hour_to').nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('salon', function (table) {
    table.json('opening_hours').nullable()
    table.dropColumn('work_hour_from')
    table.dropColumn('work_hour_to')
  })
}
