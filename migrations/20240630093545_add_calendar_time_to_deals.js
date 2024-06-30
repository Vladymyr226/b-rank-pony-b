exports.up = async function (knex) {
  return knex.schema.alterTable('deals', (table) => {
    table.datetime('calendar_time')
    table.text('notes').nullable().alter()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('deals', (table) => {
    table.dropColumn('calendar_time')
    table.text('notes').notNullable().alter()
  })
}
