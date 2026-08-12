import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, sendOk } from '@/shared/utils';
import { getOverview, pickPeriod } from '@/modules/stats/stats.service';
import { StatsPaths } from '@/modules/stats/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const statsRouter = Router();

statsRouter.get(
  StatsPaths.overview,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await getOverview(requireTenant(req), pickPeriod(req.query.period)));
    } catch (error) {
      next(error);
    }
  },
);
