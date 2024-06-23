exports.up = async function (knex) {
  return knex.schema.createTable('course', function (table) {
    table.increments('id').primary()
    table.json('data').nullable()
    table.boolean('is_active').notNullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('course')
}
