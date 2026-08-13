import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus } from '@/shared/config';
import { authMiddleware } from '@/shared/middlewares';
import { IAppRequest, ITenantContext } from '@/shared/types';
import { AppError, requireUuid, sendCreated, sendOk } from '@/shared/utils';
import {
  addAddress,
  editAddress,
  listAddresses,
  makeAddressDefault,
  removeAddress,
} from '@/modules/address/address.service';
import { AddressPaths } from '@/modules/address/types';

interface IScope {
  tenant: ITenantContext;
  userId: string;
}

const requireScope = (req: IAppRequest): IScope => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  if (!req.user?.id) {
    throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
  }

  return { tenant: req.tenant, userId: req.user.id };
};

export const addressRouter = Router();

addressRouter.use(authMiddleware);

addressRouter.get(AddressPaths.search, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, userId } = requireScope(req);

    sendOk(res, await listAddresses(tenant, userId));
  } catch (error) {
    next(error);
  }
});

addressRouter.post(AddressPaths.create, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, userId } = requireScope(req);

    sendCreated(res, await addAddress(tenant, userId, req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

addressRouter.patch(AddressPaths.update, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, userId } = requireScope(req);
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await editAddress(tenant, userId, id, req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

addressRouter.delete(AddressPaths.delete, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, userId } = requireScope(req);
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await removeAddress(tenant, userId, id));
  } catch (error) {
    next(error);
  }
});

addressRouter.patch(AddressPaths.makeDefault, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, userId } = requireScope(req);
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await makeAddressDefault(tenant, userId, id));
  } catch (error) {
    next(error);
  }
});
