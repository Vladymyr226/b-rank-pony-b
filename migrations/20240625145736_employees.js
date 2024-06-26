exports.up = async function (knex) {
  return knex.schema.createTable('employees', function (table) {
    table.increments('id').primary()
    table.integer('salon_id').references('salon.id').notNullable()
    table.integer('service_id').references('services.id').notNullable()
    table.text('first_name').notNullable()
    table.text('phone').notNullable()
    table.json('work_hours').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('employees')
}
