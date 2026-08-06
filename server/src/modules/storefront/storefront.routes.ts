import { NextFunction, Response, Router } from 'express';
import { ApiActions, ErrorMessages, HttpStatus } from '@/shared/config';
import { IAppRequest } from '@/shared/types';
import { AppError, sendOk } from '@/shared/utils';
import { getLayout } from '@/modules/storefront/storefront.service';

export const storefrontRouter = Router();

storefrontRouter.get(ApiActions.layout, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.tenant) {
      throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
    }

    sendOk(res, await getLayout(req.tenant));
  } catch (error) {
    next(error);
  }
});
