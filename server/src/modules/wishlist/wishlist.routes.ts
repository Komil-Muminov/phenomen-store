import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus } from '@/shared/config';
import { authMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, requireUuid, sendOk } from '@/shared/utils';
import { getWishlistProductIds, toggleWishlistItem } from '@/modules/wishlist/wishlist.service';

const GET_ACTION = '/get';

const TOGGLE_ACTION = '/toggle';

const requireContext = (req: IAppRequest): { tenantId: string; userId: string } => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  if (!req.user) {
    throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
  }

  return { tenantId: req.tenant.id, userId: req.user.id };
};

export const wishlistRouter = Router();

wishlistRouter.get(
  GET_ACTION,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = requireContext(req);

      sendOk(res, { ids: await getWishlistProductIds(tenantId, userId) });
    } catch (error) {
      next(error);
    }
  },
);

wishlistRouter.post(
  TOGGLE_ACTION,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = requireContext(req);
      const body = (req.body ?? {}) as Record<string, unknown>;

      sendOk(res, await toggleWishlistItem(tenantId, userId, requireUuid(body.productId, 'productId')));
    } catch (error) {
      next(error);
    }
  },
);
