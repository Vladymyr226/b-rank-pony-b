import { NextFunction } from 'express';
import { getLogger } from '../logging.js';
import { ExpressRequest, ExpressResponse } from '../types.js';

export const createRequestLogger = (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
  req.log = getLogger();
  next();
};
