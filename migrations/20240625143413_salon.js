exports.up = async function (knex) {
  return knex.schema.createTable('salon', function (table) {
    table.increments('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.text('address').notNullable()
    table.text('website').notNullable()
    table.json('opening_hours').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('salon')
}
