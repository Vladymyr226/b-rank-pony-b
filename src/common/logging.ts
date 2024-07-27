import Logger, { createLogger } from 'bunyan'
import PrettyStream from 'bunyan-prettystream'
import pkgInfo from '../../package.json'

let __logger: Logger = null

function initLogger(): Logger {
  const prettyStdOut = new PrettyStream()
  prettyStdOut.pipe(process.stdout)

  const prettyStdErr = new PrettyStream()
  prettyStdErr.pipe(process.stderr)

  return createLogger({
    name: pkgInfo.name,
    version: pkgInfo.version,
    streams: [
      {
        level: 'info',
        stream: prettyStdOut,
      },
    ],
  })
}

export function getLogger(): Logger {
  if (__logger === null) {
    __logger = initLogger()
  }
  return __logger
}
