import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { ShopActions, auditMiddleware } from '@/shared/audit';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest, ITenantContext } from '@/shared/types';
import {
  AppError,
  parsePagination,
  pickSearch,
  pickString,
  requireUuid,
  sendList,
  sendOk,
} from '@/shared/utils';
import {
  addProductReview,
  getProductReviews,
  listManagedReviews,
  pickAnsweredFilter,
  pickRatingFilter,
  replyToReview,
} from '@/modules/reviews/reviews.service';
import { ReviewLimits, ReviewPaths } from '@/modules/reviews/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest): ITenantContext => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

const requireRating = (value: unknown): number => {
  const rating = Number(value);

  if (
    !Number.isInteger(rating)
    || rating < ReviewLimits.ratingMin
    || rating > ReviewLimits.ratingMax
  ) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  return rating;
};

export const reviewsRouter = Router();

reviewsRouter.get(ReviewPaths.get, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);
    const productId = requireUuid(req.query.productId, 'productId');

    sendOk(res, await getProductReviews(tenant.id, productId));
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post(
  ReviewPaths.add,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const body = (req.body ?? {}) as Record<string, unknown>;

      if (!req.user) {
        throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
      }

      sendOk(res, await addProductReview(
        tenant.id,
        req.user.id,
        requireUuid(body.productId, 'productId'),
        requireRating(body.rating),
        pickString(body.text).slice(0, ReviewLimits.textMax),
      ));
    } catch (error) {
      next(error);
    }
  },
);

reviewsRouter.get(
  ReviewPaths.manageSearch,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const params = req.query as Record<string, unknown>;
      const pagination = parsePagination(params);

      sendList(res, await listManagedReviews(
        requireTenant(req),
        {
          search: pickSearch(params.search),
          rating: pickRatingFilter(params.rating),
          answered: pickAnsweredFilter(params.answered),
        },
        pagination.page,
        pagination.limit,
        pagination.offset,
      ));
    } catch (error) {
      next(error);
    }
  },
);

reviewsRouter.post(
  ReviewPaths.reply,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  auditMiddleware(ShopActions.reviewReply),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await replyToReview(
        requireTenant(req),
        id,
        req.user?.login ?? null,
        req.body ?? {},
      ));
    } catch (error) {
      next(error);
    }
  },
);
