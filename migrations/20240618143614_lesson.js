exports.up = async function (knex) {
  return knex.schema.createTable('lesson', function (table) {
    table.increments('id').primary()
    table.json('data').nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('lesson')
}
