import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, GuestHeader, HttpStatus } from '@/shared/config';
import { optionalAuthMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, pickString, requireUuid, sendOk } from '@/shared/utils';
import {
  applyPromoCode,
  clearCart,
  getCartState,
  parseDeliveryMethod,
  requireOwner,
  updateCartItem,
} from '@/modules/cart/cart.service';

const CartActions = {
  get: '/get',
  update: '/update',
  clear: '/clear',
  promo: '/promo',
} as const;

const resolveContext = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  const guestKey = pickString(req.headers[GuestHeader]) || null;
  const owner = requireOwner(req.user?.id ?? null, guestKey);
  const source = req.method === 'GET' ? req.query : req.body ?? {};

  return {
    tenant: req.tenant,
    owner,
    deliveryMethod: parseDeliveryMethod((source as Record<string, unknown>).deliveryMethod),
  };
};

export const cartRouter = Router();

cartRouter.use(optionalAuthMiddleware);

cartRouter.get(CartActions.get, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, owner, deliveryMethod } = resolveContext(req);

    sendOk(res, await getCartState(tenant, owner, deliveryMethod));
  } catch (error) {
    next(error);
  }
});

cartRouter.post(CartActions.update, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, owner, deliveryMethod } = resolveContext(req);
    const variantId = requireUuid(req.body?.variantId, 'variantId');

    sendOk(res, await updateCartItem(tenant, owner, variantId, Number(req.body?.quantity), deliveryMethod));
  } catch (error) {
    next(error);
  }
});

cartRouter.post(CartActions.clear, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, owner, deliveryMethod } = resolveContext(req);

    sendOk(res, await clearCart(tenant, owner, deliveryMethod));
  } catch (error) {
    next(error);
  }
});

cartRouter.post(CartActions.promo, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { tenant, owner, deliveryMethod } = resolveContext(req);
    const code = pickString(req.body?.code) || null;

    sendOk(res, await applyPromoCode(tenant, owner, code, deliveryMethod));
  } catch (error) {
    next(error);
  }
});
