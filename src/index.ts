import './common/config';
import { getLogger } from './common/logging.js';
import { runMigrations } from './common/db/migrations.js';
import { APP_TYPE } from './common/constants/index.js';
import { Server } from 'http';
import * as express from 'express';

import 'express-async-errors';
import { buildApp } from './modules/web/app.js';

const { ENVIRONMENT, PORT, AUTO_MIGRATION } = process.env;
let _server: Server = null;

async function init() {
  const log = getLogger();
  log.info(
    {
      environment: ENVIRONMENT,
    },
    'app_start',
  );

  let serverApp: express.Application = null;
  log.info({ type: process.env.APP_TYPE }, 'Starting application');

  switch (process.env.APP_TYPE) {
    case APP_TYPE.BOT: {
      if (+AUTO_MIGRATION) await runMigrations();
      serverApp = buildApp();
      break;
    }
  }

  if (!serverApp) {
    throw new Error('No server app was defined, terminating');
  }

  let port = parseInt(PORT, 10);

  if (!port) {
    log.warn({}, 'Port is not defined, using default');
    port = 5000;
  }

  _server = serverApp.listen(port, () => {
    log.info(
      {
        port: PORT,
      },
      'listening...',
    );
  });
}

init().catch((err) => {
  getLogger().error(err, 'Root error');
  process.exit(1);
});
