import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus } from '@/shared/config';
import { authMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, pickString, requireUuid, sendOk } from '@/shared/utils';
import { addProductReview, getProductReviews } from '@/modules/reviews/reviews.service';

const GET_ACTION = '/get';

const ADD_ACTION = '/add';

const RATING_MIN = 1;

const RATING_MAX = 5;

const requireTenantId = (req: IAppRequest): string => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant.id;
};

const requireRating = (value: unknown): number => {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  return rating;
};

export const reviewsRouter = Router();

reviewsRouter.get(GET_ACTION, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const productId = requireUuid(req.query.productId, 'productId');

    sendOk(res, await getProductReviews(tenantId, productId));
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post(
  ADD_ACTION,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = requireTenantId(req);
      const body = (req.body ?? {}) as Record<string, unknown>;

      if (!req.user) {
        throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
      }

      sendOk(res, await addProductReview(
        tenantId,
        req.user.id,
        requireUuid(body.productId, 'productId'),
        requireRating(body.rating),
        pickString(body.text),
      ));
    } catch (error) {
      next(error);
    }
  },
);
