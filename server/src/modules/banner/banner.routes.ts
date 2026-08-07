import { NextFunction, Response, Router } from 'express';
import { ApiActions, ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, requireUuid, sendCreated, sendOk } from '@/shared/utils';
import {
  createBanner,
  deactivateBanner,
  listBanners,
  updateBanner,
} from '@/modules/banner/banner.service';
import { BannerPaths } from '@/modules/banner/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const bannerRouter = Router();

bannerRouter.get(
  BannerPaths.manageSearch,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await listBanners(requireTenant(req)));
    } catch (error) {
      next(error);
    }
  },
);

bannerRouter.post(
  ApiActions.create,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, await createBanner(requireTenant(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

bannerRouter.patch(
  ApiActions.update,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await updateBanner(requireTenant(req), id, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

bannerRouter.patch(
  ApiActions.deactivate,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await deactivateBanner(requireTenant(req), id));
    } catch (error) {
      next(error);
    }
  },
);
