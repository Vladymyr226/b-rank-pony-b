import './common/config';
import { buildApp } from './modules/web/app';
import { getLogger } from './common/logging';
// import { runMigrations } from './common/db/migrations';
import { APP_TYPE } from './common/constants';
import { Server } from 'http';
import express, { Request, Response } from 'express';
import 'express-async-errors';
import { json, urlencoded } from 'body-parser';
import { createRequestLogger } from './common/middlewares/logger';

const { ENVIRONMENT, PORT, AUTO_MIGRATION } = process.env;

const app = express();

app.use(express.json());

// get post routes
app.get('/post', (req: Request, res: Response) => {
  res.status(200).json({ message: 'post routes' });
});

// root routes
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Hello World' });
});

if (!app) {
  throw new Error('No server app was defined, terminating');
}

let port = parseInt(PORT, 10);

if (!port) {
  console.warn({}, 'Port is not defined, using default');
  port = 5000;
}

app.listen(port, () => {
  console.log('Listening on port ' + port);
});

console.log(222222222, app);
export default app;

// app.listen(PORT, () => {console.log('Listening on port ' + PORT)});
