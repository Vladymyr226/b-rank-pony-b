exports.up = async function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary()
    table.integer('user_tg_id').notNullable()
    table.string('username', 255).notNullable()
    table.string('phone_number', 15).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('users')
}
