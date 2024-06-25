exports.up = async function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('first_name', 255).nullable()
    table.string('last_name', 255).nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('first_name')
    table.dropColumn('last_name')
  })
}
