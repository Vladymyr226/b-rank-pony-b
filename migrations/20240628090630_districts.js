exports.up = async function (knex) {
  return knex.schema.createTable('districts', function (table) {
    table.increments('id').primary()
    table.string('name', 255).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('districts')
}
