exports.up = async function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.integer('chat_id').nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.dropColumn('chat_id')
  })
}
