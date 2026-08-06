import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthHeader, AuthScheme, Env, ErrorMessages, HttpStatus } from '@/shared/config';
import { IAppRequest, IPlatformContext, IUserContext, TPlatformRole, TUserRole } from '@/shared/types';
import { AppError } from '@/shared/utils';

const PLATFORM_SCOPE = 'platform';

const readBearerToken = (req: IAppRequest): string | null => {
  const header = req.headers[AuthHeader];

  return typeof header === 'string' && header.startsWith(AuthScheme)
    ? header.slice(AuthScheme.length)
    : null;
};

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

export const platformAuthMiddleware = (
  req: IAppRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const token = readBearerToken(req);

  if (!token) {
    next(new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized));

    return;
  }

  try {
    const payload = jwt.verify(token, Env.platform.jwtSecret) as IPlatformContext;

    if (payload.scope !== PLATFORM_SCOPE) {
      throw new AppError(ErrorMessages.forbidden, HttpStatus.forbidden);
    }

    req.platform = payload;
    next();
  } catch {
    next(new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized));
  }
};

export const platformRoleMiddleware = (roles: TPlatformRole[]) => (
  req: IAppRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const role = req.platform?.role;
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
