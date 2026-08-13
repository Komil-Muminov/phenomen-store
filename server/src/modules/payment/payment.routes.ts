import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { ShopActions, auditMiddleware } from '@/shared/audit';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest, ITenantContext } from '@/shared/types';
import {
  AppError,
  parsePagination,
  pickSearch,
  requireUuid,
  sendList,
  sendOk,
} from '@/shared/utils';
import {
  getPaymentCard,
  listPayments,
  pickPaymentStatus,
  reviewReceipt,
  submitReceipt,
} from '@/modules/payment/payment.service';
import { PaymentPaths } from '@/modules/payment/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest): ITenantContext => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

const isStaff = (role: string): boolean => STAFF_ROLES.some((staff) => staff === role);

export const paymentRouter = Router();

paymentRouter.get(PaymentPaths.card, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendOk(res, await getPaymentCard(requireTenant(req)));
  } catch (error) {
    next(error);
  }
});

paymentRouter.post(
  PaymentPaths.receipt,
  authMiddleware,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const orderId = requireUuid(req.params.id, 'id');
      const scopeId = isStaff(req.user?.role ?? '') ? null : req.user?.id ?? '';

      sendOk(res, await submitReceipt(requireTenant(req), orderId, scopeId, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

paymentRouter.patch(
  PaymentPaths.review,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  auditMiddleware(ShopActions.paymentReview),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const orderId = requireUuid(req.params.id, 'id');

      sendOk(res, await reviewReceipt(
        requireTenant(req),
        orderId,
        req.user?.login ?? null,
        req.body ?? {},
      ));
    } catch (error) {
      next(error);
    }
  },
);

paymentRouter.get(
  PaymentPaths.manageSearch,
  authMiddleware,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const params = req.query as Record<string, unknown>;
      const pagination = parsePagination(params);

      sendList(res, await listPayments(
        requireTenant(req),
        { search: pickSearch(params.search), status: pickPaymentStatus(params.status) },
        pagination.page,
        pagination.limit,
        pagination.offset,
      ));
    } catch (error) {
      next(error);
    }
  },
);
