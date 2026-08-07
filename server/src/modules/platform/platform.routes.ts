import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, PlatformRoles } from '@/shared/config';
import { platformAuthMiddleware, platformRoleMiddleware } from '@/shared/middlewares';
import { IAppRequest, IPlatformContext } from '@/shared/types';
import {
  AppError,
  parsePagination,
  requireFields,
  requireUuid,
  sendCreated,
  sendList,
  sendOk,
} from '@/shared/utils';
import {
  activateTenant,
  authenticatePlatform,
  changePlatformPassword,
  createTenant,
  createTenantOwner,
  listAudit,
  listAuditActions,
  deactivateTenant,
  listTenants,
  signIn,
  updateTenant,
} from '@/modules/platform/platform.service';
import { ICreateOwnerPayload, ICreateTenantPayload, PlatformPaths } from '@/modules/platform/types';

const requireActor = (req: IAppRequest): IPlatformContext => {
  if (!req.platform) {
    throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
  }

  return req.platform;
};

const readIp = (req: IAppRequest): string | null => req.ip ?? null;

export const platformRouter = Router();

platformRouter.post(
  PlatformPaths.login,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;

      requireFields(body, ['login', 'password']);
      sendOk(res, await authenticatePlatform(body.login, body.password, readIp(req)));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.post(
  PlatformPaths.signin,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;

      requireFields(body, ['login', 'password']);
      sendOk(res, await signIn(body.login, body.password, readIp(req)));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.use(platformAuthMiddleware);

platformRouter.patch(
  PlatformPaths.passwordUpdate,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;

      requireFields(body, ['currentPassword', 'newPassword']);
      sendOk(res, await changePlatformPassword(
        requireActor(req),
        body.currentPassword,
        body.newPassword,
        readIp(req),
      ));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.get(
  PlatformPaths.auditSearch,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const params = req.query as Record<string, unknown>;
      const { page, limit, offset } = parsePagination(params);

      sendList(res, await listAudit(params, page, limit, offset));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.get(
  PlatformPaths.auditActions,
  async (_req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await listAuditActions());
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.get(
  PlatformPaths.tenantSearch,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

      sendList(res, await listTenants(page, limit, offset));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.post(
  PlatformPaths.tenantCreate,
  platformRoleMiddleware([PlatformRoles.superadmin]),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;

      requireFields(body, ['key', 'name']);
      sendCreated(
        res,
        await createTenant(requireActor(req), body as unknown as ICreateTenantPayload, readIp(req)),
      );
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.patch(
  PlatformPaths.tenantUpdate,
  platformRoleMiddleware([PlatformRoles.superadmin]),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await updateTenant(requireActor(req), id, req.body ?? {}, readIp(req)));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.patch(
  PlatformPaths.tenantDeactivate,
  platformRoleMiddleware([PlatformRoles.superadmin]),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await deactivateTenant(requireActor(req), id, readIp(req)));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.patch(
  PlatformPaths.tenantActivate,
  platformRoleMiddleware([PlatformRoles.superadmin]),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await activateTenant(requireActor(req), id, readIp(req)));
    } catch (error) {
      next(error);
    }
  },
);

platformRouter.post(
  PlatformPaths.ownerCreate,
  platformRoleMiddleware([PlatformRoles.superadmin]),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');
      const body = (req.body ?? {}) as Record<string, unknown>;

      requireFields(body, ['password', 'name']);
      sendCreated(
        res,
        await createTenantOwner(
          requireActor(req),
          id,
          body as unknown as ICreateOwnerPayload,
          readIp(req),
        ),
      );
    } catch (error) {
      next(error);
    }
  },
);
