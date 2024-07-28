exports.up = async function (knex) {
  return knex.schema.createTable('orders', function (table) {
    table.increments('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.text('address').notNullable()
    table.text('website').nullable()
    table.text('opening_hours').notNullable()
    table.text('phone').notNullable()
    table.boolean('done').defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('orders')
}
