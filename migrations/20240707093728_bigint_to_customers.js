exports.up = function (knex) {
  return knex.schema.alterTable('customers', function (table) {
    table.bigint('user_tg_id').alter()
    table.bigint('chat_id').alter()
    table.string('username').nullable().alter()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('customers', function (table) {
    table.integer('user_tg_id').alter()
    table.integer('chat_id').alter()
    table.string('username').notNullable().alter()
  })
}
