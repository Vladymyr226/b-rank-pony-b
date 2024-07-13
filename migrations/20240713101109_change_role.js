exports.up = async function (knex) {
  return knex.schema.createTable('change_role', function (table) {
    table.increments('id').primary()
    table.bigint('user_tg_id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('change_role')
}
