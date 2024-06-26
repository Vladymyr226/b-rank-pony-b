exports.up = async function (knex) {
  return knex.schema.alterTable('admins', (table) => {
    table.string('first_name', 255).nullable()
    table.string('last_name', 255).nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('admins', (table) => {
    table.dropColumn('first_name')
    table.dropColumn('last_name')
  })
}
