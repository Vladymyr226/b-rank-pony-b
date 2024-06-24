import Logger, { createLogger } from 'bunyan';
import pkgInfo from "../../package.json";

let __logger: Logger = null;

function initLogger(): Logger {
  return createLogger({
    name: pkgInfo.name,
    version: pkgInfo.version,
  });
}

export function getLogger(): Logger {
  if (__logger === null) {
    __logger = initLogger();
  }
  return __logger;
}