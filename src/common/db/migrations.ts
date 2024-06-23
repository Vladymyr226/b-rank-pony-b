import knex from 'knex';
import { getLogger } from '../logging.js';
import { getKnexConfig } from './knex.js';

export async function runMigrations() {
  getLogger().info('Running DB migrations...');
  const knexdb = knex(getKnexConfig());
  await knexdb.migrate.latest();
  getLogger().info('Migrations complete!');
  await knexdb.destroy();
}
