import { NextFunction, Response, Router } from 'express';
import { PlatformRoles } from '@/shared/config';
import { platformAuthMiddleware, platformRoleMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { sendOk } from '@/shared/utils';
import {
  getBillingSettings,
  listBlockedTenants,
  releaseTenantBlock,
  runBillingCheck,
  saveBillingSettings,
} from '@/modules/billing/billing.service';
import { BillingPaths } from '@/modules/billing/types';

const PLATFORM_ROLES = [PlatformRoles.superadmin, PlatformRoles.operator];

export const billingRouter = Router();

billingRouter.use(platformAuthMiddleware, platformRoleMiddleware(PLATFORM_ROLES));

billingRouter.get(
  BillingPaths.settings,
  async (_req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await getBillingSettings());
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.patch(
  BillingPaths.settings,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await saveBillingSettings(req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.post(
  BillingPaths.run,
  async (_req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await runBillingCheck());
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.get(
  BillingPaths.blocked,
  async (_req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await listBlockedTenants());
    } catch (error) {
      next(error);
    }
  },
);

billingRouter.patch(
  BillingPaths.blocked,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await releaseTenantBlock(req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);
