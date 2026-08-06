import { NextFunction, Request, Response } from 'express';
import { Env, ErrorMessages, HttpStatus } from '@/shared/config';
import { AppError } from '@/shared/utils';

export const notFoundMiddleware = (_req: Request, res: Response): void => {
  res.status(HttpStatus.notFound).json({ success: false, message: ErrorMessages.notFound });
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isAppError = error instanceof AppError;
  const status = isAppError ? error.status : HttpStatus.serverError;
  const message = isAppError ? error.message : ErrorMessages.internal;

  console.error('[api-error]', error);

  res.status(status).json({
    success: false,
    message: Env.isProduction && !isAppError ? ErrorMessages.internal : message,
  });
};
