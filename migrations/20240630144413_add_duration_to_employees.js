exports.up = async function (knex) {
  return knex.schema.alterTable('employees', (table) => {
    table.integer('duration').nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('employees', (table) => {
    table.dropColumn('duration')
  })
}
