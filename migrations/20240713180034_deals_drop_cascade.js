exports.up = function (knex) {
  return knex.schema.alterTable('deals', function (table) {
    table.dropForeign('salon_id')
    table.foreign('salon_id').references('salon.id').onDelete('CASCADE')
    table.dropForeign('service_id')
    table.foreign('service_id').references('services.id').onDelete('CASCADE')
    table.dropForeign('customer_id')
    table.foreign('customer_id').references('customers.id').onDelete('CASCADE')
    table.dropForeign('employee_id')
    table.foreign('employee_id').references('employees.id').onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('deals', function (table) {
    table.dropForeign('salon_id')
    table.foreign('salon_id').references('salon.id')
    table.dropForeign('service_id')
    table.foreign('service_id').references('services.id')
    table.dropForeign('customer_id')
    table.foreign('customer_id').references('customers.id')
    table.dropForeign('employee_id')
    table.foreign('employee_id').references('employees.id')
  })
}
