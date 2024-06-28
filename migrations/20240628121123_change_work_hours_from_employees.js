exports.up = async function (knex) {
  return knex.schema.alterTable('employees', function (table) {
    table.dropColumn('work_hours')
    table.time('work_hour_from').nullable()
    table.time('work_hour_to').nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('employees', function (table) {
    table.json('work_hours').nullable()
    table.dropColumn('work_hour_from')
    table.dropColumn('work_hour_to')
  })
}
