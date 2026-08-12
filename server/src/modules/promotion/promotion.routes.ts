import { NextFunction, Response, Router } from 'express';
import { ApiActions, ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { ShopActions, auditMiddleware } from '@/shared/audit';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import {
  AppError,
  parsePagination,
  pickFlag,
  pickSearch,
  requireUuid,
  sendCreated,
  sendList,
  sendOk,
} from '@/shared/utils';
import {
  createPromotion,
  listPromotions,
  removePromotion,
  updatePromotion,
} from '@/modules/promotion/promotion.service';
import { PromotionPaths } from '@/modules/promotion/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const promotionRouter = Router();

promotionRouter.use(authMiddleware, rbacMiddleware(STAFF_ROLES));

promotionRouter.get(
  PromotionPaths.manageSearch,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const params = req.query as Record<string, unknown>;
      const { page, limit, offset } = parsePagination(params);
      const filters = { search: pickSearch(params.search), isActive: pickFlag(params.isActive) };

      sendList(res, await listPromotions(requireTenant(req), filters, page, limit, offset));
    } catch (error) {
      next(error);
    }
  },
);

promotionRouter.post(
  ApiActions.create,
  auditMiddleware(ShopActions.promotionCreate),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, await createPromotion(requireTenant(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

promotionRouter.patch(
  ApiActions.update,
  auditMiddleware(ShopActions.promotionUpdate),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await updatePromotion(requireTenant(req), id, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

promotionRouter.delete(
  ApiActions.delete,
  auditMiddleware(ShopActions.promotionDelete),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await removePromotion(requireTenant(req), id));
    } catch (error) {
      next(error);
    }
  },
);
