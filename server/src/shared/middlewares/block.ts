import { NextFunction, Response } from 'express';
import { ApiRoutes, HttpStatus } from '@/shared/config';
import { IAppRequest } from '@/shared/types';
import { AppError } from '@/shared/utils';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const ALLOWED_PREFIXES = [
  ApiRoutes.invoices,
  ApiRoutes.tickets,
  ApiRoutes.support,
  ApiRoutes.auth,
  ApiRoutes.media,
  ApiRoutes.notifications,
];

const isAllowed = (path: string): boolean => (
  ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))
);

export const blockGuardMiddleware = (message: string) => (
  (req: IAppRequest, _res: Response, next: NextFunction): void => {
    if (!req.tenant?.blocked || SAFE_METHODS.includes(req.method) || isAllowed(req.path)) {
      next();

      return;
    }

    next(new AppError(message, HttpStatus.forbidden));
  }
);
