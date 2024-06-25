exports.up = async function (knex) {
  return knex.schema.createTable('deals', function (table) {
    table.increments('id').primary()
    table.integer('salon_id').references('salon.id').notNullable()
    table.integer('service_id').references('services.id').notNullable()
    table.integer('customer_id').references('users.id').notNullable()
    table.integer('employee_id').references('employees.id').notNullable()
    table.text('notes').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('deals')
}
