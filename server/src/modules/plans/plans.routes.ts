import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, sendOk } from '@/shared/utils';
import { getPlanUsage, listPlans } from '@/modules/plans/plans.service';
import { PlanPaths } from '@/modules/plans/types';

const OWNER_ROLES = [UserRoles.admin, UserRoles.owner, UserRoles.platform];

export const planRouter = Router();

planRouter.get(PlanPaths.catalog, (_req: IAppRequest, res: Response) => {
  sendOk(res, listPlans());
});

planRouter.get(
  PlanPaths.current,
  authMiddleware,
  rbacMiddleware(OWNER_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) {
        throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
      }

      sendOk(res, await getPlanUsage(req.tenant));
    } catch (error) {
      next(error);
    }
  },
);
