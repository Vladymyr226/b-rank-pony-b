exports.up = async function (knex) {
  return knex.schema.createTable('services', function (table) {
    table.increments('id').primary()
    table.integer('salon_id').references('salon.id').notNullable()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.integer('price').notNullable()
    table.integer('duration').notNullable()

    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('services')
}
