import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthHeader, AuthScheme, Env, ErrorMessages, HttpStatus } from '@/shared/config';
import { IAppRequest, IUserContext, TUserRole } from '@/shared/types';
import { AppError } from '@/shared/utils';

export const authMiddleware = (req: IAppRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers[AuthHeader];
  const token = typeof header === 'string' && header.startsWith(AuthScheme)
    ? header.slice(AuthScheme.length)
    : null;

  if (!token) {
    next(new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized));

    return;
  }

  try {
    const payload = jwt.verify(token, Env.jwtSecret) as IUserContext;

    if (!req.tenant || payload.tenantId !== req.tenant.id) {
      throw new AppError(ErrorMessages.forbidden, HttpStatus.forbidden);
    }

    req.user = payload;
    next();
  } catch {
    next(new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized));
  }
};

export const rbacMiddleware = (roles: TUserRole[]) => (
  req: IAppRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const role = req.user?.role;
  const allowed = role !== undefined && roles.includes(role);

  next(allowed ? undefined : new AppError(ErrorMessages.forbidden, HttpStatus.forbidden));
};

export const optionalAuthMiddleware = (
  req: IAppRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers[AuthHeader];

  if (typeof header !== 'string' || !header.startsWith(AuthScheme)) {
    next();

    return;
  }

  try {
    req.user = jwt.verify(header.slice(AuthScheme.length), Env.jwtSecret) as IUserContext;
  } catch {
    req.user = undefined;
  }

  next();
};
