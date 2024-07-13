exports.up = function (knex) {
  return knex.schema.alterTable('employees_services', function (table) {
    table.dropForeign('employee_id')
    table.foreign('employee_id').references('employees.id').onDelete('CASCADE')
    table.dropForeign('service_id')
    table.foreign('service_id').references('services.id').onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('employees_services', function (table) {
    table.dropForeign('employee_id')
    table.foreign('employee_id').references('employees.id')
    table.dropForeign('service_id')
    table.foreign('service_id').references('services.id')
  })
}
