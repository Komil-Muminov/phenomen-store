import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, requireUuid, sendCreated, sendOk } from '@/shared/utils';
import {
  createAttribute,
  deleteAttribute,
  listAttributes,
  updateAttribute,
} from '@/modules/attributes/attributes.service';
import { AttributePaths } from '@/modules/attributes/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const attributeRouter = Router();

attributeRouter.get(
  AttributePaths.search,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await listAttributes(requireTenant(req)));
    } catch (error) {
      next(error);
    }
  },
);

attributeRouter.post(
  AttributePaths.create,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, await createAttribute(requireTenant(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

attributeRouter.delete(
  AttributePaths.remove,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await deleteAttribute(requireTenant(req), id));
    } catch (error) {
      next(error);
    }
  },
);

attributeRouter.patch(
  AttributePaths.update,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await updateAttribute(requireTenant(req), id, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);
