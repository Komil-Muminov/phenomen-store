import { NextFunction, Response, Router } from 'express';
import { ApiActions, Env, ErrorMessages, HttpStatus, TenantHeader, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, pickString, sendOk } from '@/shared/utils';
import { getPublicConfig, resolveTenantByKey, updateTenantConfig } from '@/modules/tenant/tenant.service';

export const tenantMiddleware = async (
  req: IAppRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const headerValue = req.headers[TenantHeader];
  const key = pickString(headerValue, Env.isProduction ? '' : Env.defaultTenantKey);

  if (!key) {
    next(new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest));

    return;
  }

  try {
    req.tenant = await resolveTenantByKey(key);
    next();
  } catch (error) {
    next(error);
  }
};

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const tenantRouter = Router();

tenantRouter.get(ApiActions.config, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendOk(res, await getPublicConfig(requireTenant(req)));
  } catch (error) {
    next(error);
  }
});

tenantRouter.patch(
  ApiActions.config,
  authMiddleware,
  rbacMiddleware([UserRoles.admin, UserRoles.owner, UserRoles.platform]),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await updateTenantConfig(requireTenant(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);
