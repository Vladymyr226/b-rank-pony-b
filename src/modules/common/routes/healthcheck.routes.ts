import express, { Application, Request, Response } from 'express'

import pkgInfo from '../../../../package.json'
const { ENVIRONMENT } = process.env

export function configureHealthCheckRouter(app: Application) {
  app.get(['/info', '/', '/healthz', '/healthcheck'], (req: Request, res: Response) => {
    res
      .set('Content-Type', 'application/json')
      .set('Cache-Control', 'no-store')
      .send(
        JSON.stringify({
          status: 'ok',
          environment: ENVIRONMENT,
          time: new Date().toUTCString(),
          version: pkgInfo.version,
        }),
      )
  })
}

export function createSimpleHealthCheckApp(): Application {
  const app = express()

  configureHealthCheckRouter(app)

  return app
}
