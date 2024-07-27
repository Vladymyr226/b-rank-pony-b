exports.up = function (knex) {
  return knex.schema.alterTable('admins', function (table) {
    table.unique('salon_id')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('admins', function (table) {
    table.dropUnique('salon_id')
  })
}
