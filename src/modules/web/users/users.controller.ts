import { usersService } from './users.service.js';
import fs from 'fs';
import { ExpressRequest, ExpressResponse } from '../../../common/types.js';

const createUser = async (req: ExpressRequest, res: ExpressResponse) => {
  const result = await usersService.createUser(req.query);

  return res.status(result.status).json(result);
};

const login = async (req: ExpressRequest, res: ExpressResponse) => {
  const result = await usersService.loginUser(req.query);

  let base64 = null;
  if (req.body.mas.length) {
    base64 = Buffer.from(req.body.mas);

    fs.writeFileSync('static/index.png', base64);
  }

  return res.status(result.status).json(result);
};

export const UsersController = {
  createUser,
  login,
};
