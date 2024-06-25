exports.up = async function (knex) {
  return knex.schema.createTable('employees_services', function (table) {
    table.increments('id').primary()
    table.integer('employee_id').references('employees.id').notNullable()
    table.integer('service_id').references('services.id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('employees_services')
}
