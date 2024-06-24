exports.up = async function (knex) {
  return knex.schema.createTable('tags', function (table) {
    table.increments('id').primary()
    table.string('name_of_tag', 32).notNullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('tags')
}
