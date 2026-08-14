import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, PlatformRoles, UserRoles } from '@/shared/config';
import {
  authMiddleware,
  platformAuthMiddleware,
  platformRoleMiddleware,
  rbacMiddleware,
} from '@/shared/middlewares';
import { IAppRequest, ITenantContext } from '@/shared/types';
import {
  AppError,
  parsePagination,
  pickSearch,
  pickUuid,
  requireUuid,
  sendCreated,
  sendList,
  sendOk,
} from '@/shared/utils';
import {
  cancelInvoice,
  getInvoice,
  getPlatformCard,
  issueInvoice,
  listInvoices,
  pickInvoiceStatus,
  reviewInvoice,
  savePlatformCard,
  submitInvoiceReceipt,
} from '@/modules/invoice/invoice.service';
import { InvoicePaths, PlatformInvoicePaths } from '@/modules/invoice/types';

const OWNER_ROLES = [UserRoles.admin, UserRoles.owner, UserRoles.platform];

const PLATFORM_ROLES = [PlatformRoles.superadmin, PlatformRoles.operator];

const requireTenant = (req: IAppRequest): ITenantContext => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

const readPagination = (req: IAppRequest) => parsePagination(req.query as Record<string, unknown>);

const readFilters = (req: IAppRequest, tenantId: string | null) => {
  const params = req.query as Record<string, unknown>;

  return {
    search: pickSearch(params.search),
    status: pickInvoiceStatus(params.status),
    tenantId: tenantId ?? pickUuid(params.tenantId, 'tenantId'),
  };
};

export const invoiceRouter = Router();

invoiceRouter.use(authMiddleware, rbacMiddleware(OWNER_ROLES));

invoiceRouter.get(InvoicePaths.card, async (_req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendOk(res, await getPlatformCard());
  } catch (error) {
    next(error);
  }
});

invoiceRouter.get(InvoicePaths.search, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);
    const pagination = readPagination(req);

    sendList(res, await listInvoices(
      readFilters(req, tenant.id),
      pagination.page,
      pagination.limit,
      pagination.offset,
    ));
  } catch (error) {
    next(error);
  }
});

invoiceRouter.get(InvoicePaths.get, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await getInvoice(id, requireTenant(req).id));
  } catch (error) {
    next(error);
  }
});

invoiceRouter.post(InvoicePaths.receipt, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await submitInvoiceReceipt(requireTenant(req), id, req.body ?? {}));
  } catch (error) {
    next(error);
  }
});

export const platformInvoiceRouter = Router();

platformInvoiceRouter.use(platformAuthMiddleware, platformRoleMiddleware(PLATFORM_ROLES));

platformInvoiceRouter.get(
  PlatformInvoicePaths.settings,
  async (_req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await getPlatformCard());
    } catch (error) {
      next(error);
    }
  },
);

platformInvoiceRouter.patch(
  PlatformInvoicePaths.settings,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await savePlatformCard(req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

platformInvoiceRouter.get(
  PlatformInvoicePaths.search,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const pagination = readPagination(req);

      sendList(res, await listInvoices(
        readFilters(req, null),
        pagination.page,
        pagination.limit,
        pagination.offset,
      ));
    } catch (error) {
      next(error);
    }
  },
);

platformInvoiceRouter.post(
  PlatformInvoicePaths.create,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, await issueInvoice(req.body ?? {}, req.platform?.login ?? ''));
    } catch (error) {
      next(error);
    }
  },
);

platformInvoiceRouter.get(
  PlatformInvoicePaths.get,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await getInvoice(requireUuid(req.params.id, 'id'), null));
    } catch (error) {
      next(error);
    }
  },
);

platformInvoiceRouter.patch(
  PlatformInvoicePaths.review,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await reviewInvoice(id, req.platform?.login ?? null, req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

platformInvoiceRouter.patch(
  PlatformInvoicePaths.cancel,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await cancelInvoice(requireUuid(req.params.id, 'id')));
    } catch (error) {
      next(error);
    }
  },
);
