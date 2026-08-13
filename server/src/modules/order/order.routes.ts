import { NextFunction, Response, Router } from 'express';
import { ApiActions, ErrorMessages, GuestHeader, HttpStatus, IdempotencyHeader, UserRoles } from '@/shared/config';
import { authMiddleware, optionalAuthMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { ShopActions, auditMiddleware } from '@/shared/audit';
import { IAppRequest } from '@/shared/types';
import {
  AppError,
  parsePagination,
  pickSearch,
  pickString,
  requireUuid,
  sendCreated,
  sendList,
  sendOk,
} from '@/shared/utils';
import { parseDeliveryMethod, requireOwner } from '@/modules/cart';
import {
  changeOrderStatus,
  createOrder,
  changeDeliveryStatus,
  getOrder,
  repeatOrder,
  getOrders,
  getTenantOrders,
} from '@/modules/order/order.service';
import { OrderStatus, TOrderStatus } from '@/modules/order/types';

const OrderActions = {
  cancel: '/cancel/:id',
  delivery: '/delivery/:id',
  repeat: '/repeat/:id',
  status: '/status/:id',
  manageSearch: '/manage/search',
} as const;

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const isStaff = (role: string): boolean => STAFF_ROLES.some((staff) => staff === role);

const readScopeUserId = (req: IAppRequest): string | null => (
  isStaff(req.user?.role ?? '') ? null : req.user?.id ?? ''
);

const ORDER_STATUSES: string[] = Object.values(OrderStatus);

const requireOrderStatus = (value: unknown): TOrderStatus => {
  const status = pickString(value);

  if (!ORDER_STATUSES.includes(status)) {
    throw new AppError(ErrorMessages.invalidPayload, HttpStatus.badRequest);
  }

  return status as TOrderStatus;
};

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

export const orderRouter = Router();

orderRouter.post(
  ApiActions.create,
  optionalAuthMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const owner = requireOwner(req.user?.id ?? null, pickString(req.headers[GuestHeader]) || null);
      const idempotencyKey = pickString(req.headers[IdempotencyHeader]) || null;

      sendCreated(res, await createOrder(tenant, owner, req.body ?? {}, idempotencyKey));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.get(
  ApiActions.search,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const { page, limit } = parsePagination(req.query as Record<string, unknown>);

      sendList(res, await getOrders(tenant, req.user?.id ?? '', page, limit));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.get(
  OrderActions.manageSearch,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const { page, limit } = parsePagination(req.query as Record<string, unknown>);
      const status = pickString(req.query.status) || null;
      const search = pickSearch(req.query.search);

      sendList(res, await getTenantOrders(tenant, status, search, page, limit));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.get(
  ApiActions.get,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await getOrder(
        requireTenant(req),
        requireUuid(req.params.id, 'id'),
        readScopeUserId(req),
      ));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.post(
  OrderActions.repeat,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const owner = requireOwner(req.user?.id ?? null, null);
      const orderId = requireUuid(req.params.id, 'id');
      const deliveryMethod = parseDeliveryMethod(req.query.deliveryMethod);

      sendOk(res, await repeatOrder(tenant, owner, orderId, deliveryMethod));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.post(
  OrderActions.cancel,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const orderId = requireUuid(req.params.id, 'id');

      sendOk(res, await changeOrderStatus(tenant, orderId, OrderStatus.cancelled, req.user?.id ?? null));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.patch(
  OrderActions.delivery,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  auditMiddleware(ShopActions.deliveryUpdate),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const orderId = requireUuid(req.params.id, 'id');

      sendOk(res, await changeDeliveryStatus(
        tenant,
        orderId,
        req.body ?? {},
        req.user?.id ?? null,
      ));
    } catch (error) {
      next(error);
    }
  },
);

orderRouter.post(
  OrderActions.status,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  auditMiddleware(ShopActions.orderStatus),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      const orderId = requireUuid(req.params.id, 'id');
      const status = requireOrderStatus(req.body?.status);

      sendOk(res, await changeOrderStatus(tenant, orderId, status, req.user?.id ?? null));
    } catch (error) {
      next(error);
    }
  },
);
