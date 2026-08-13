import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, UserRoles } from '@/shared/config';
import { ShopActions, auditMiddleware } from '@/shared/audit';
import { authMiddleware, rbacMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import {
  AppError,
  parsePagination,
  pickSearch,
  requireUuid,
  sendCreated,
  sendList,
  sendOk,
} from '@/shared/utils';
import {
  closeConversation,
  getConversation,
  listConversations,
  pickStatus,
  readConversation,
  replyToConversation,
  startConversation,
} from '@/modules/support/support.service';
import { MessageAuthors, SupportPaths } from '@/modules/support/types';

const STAFF_ROLES = [UserRoles.manager, UserRoles.admin, UserRoles.owner, UserRoles.platform];

const requireTenant = (req: IAppRequest) => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant;
};

const requireUserId = (req: IAppRequest): string => {
  if (!req.user?.id) {
    throw new AppError(ErrorMessages.unauthorized, HttpStatus.unauthorized);
  }

  return req.user.id;
};

const readFilters = (req: IAppRequest) => {
  const params = req.query as Record<string, unknown>;

  return {
    pagination: parsePagination(params),
    filters: { search: pickSearch(params.search), status: pickStatus(params.status) },
  };
};

export const supportRouter = Router();

supportRouter.use(authMiddleware);

supportRouter.get(SupportPaths.search, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { pagination, filters } = readFilters(req);

    sendList(res, await listConversations(
      requireTenant(req),
      requireUserId(req),
      filters,
      pagination.page,
      pagination.limit,
      pagination.offset,
    ));
  } catch (error) {
    next(error);
  }
});

supportRouter.post(SupportPaths.create, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    sendCreated(res, await startConversation(
      requireTenant(req),
      requireUserId(req),
      req.user?.login ?? null,
      req.body ?? {},
    ));
  } catch (error) {
    next(error);
  }
});

supportRouter.get(SupportPaths.get, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await getConversation(requireTenant(req), id, requireUserId(req)));
  } catch (error) {
    next(error);
  }
});

supportRouter.post(SupportPaths.reply, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');
    const userId = requireUserId(req);

    sendOk(res, await replyToConversation(
      requireTenant(req),
      id,
      MessageAuthors.customer,
      req.user?.login ?? null,
      req.body ?? {},
      userId,
    ));
  } catch (error) {
    next(error);
  }
});

supportRouter.patch(SupportPaths.read, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await readConversation(
      requireTenant(req),
      id,
      MessageAuthors.shop,
      requireUserId(req),
    ));
  } catch (error) {
    next(error);
  }
});

supportRouter.get(
  SupportPaths.manageSearch,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { pagination, filters } = readFilters(req);

      sendList(res, await listConversations(
        requireTenant(req),
        null,
        filters,
        pagination.page,
        pagination.limit,
        pagination.offset,
      ));
    } catch (error) {
      next(error);
    }
  },
);

supportRouter.get(
  SupportPaths.manageGet,
  rbacMiddleware(STAFF_ROLES),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');
      const tenant = requireTenant(req);

      await readConversation(tenant, id, MessageAuthors.customer, null);
      sendOk(res, await getConversation(tenant, id, null));
    } catch (error) {
      next(error);
    }
  },
);

supportRouter.post(
  SupportPaths.manageReply,
  rbacMiddleware(STAFF_ROLES),
  auditMiddleware(ShopActions.supportReply),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await replyToConversation(
        requireTenant(req),
        id,
        MessageAuthors.shop,
        req.user?.login ?? null,
        req.body ?? {},
        null,
      ));
    } catch (error) {
      next(error);
    }
  },
);

supportRouter.patch(
  SupportPaths.manageClose,
  rbacMiddleware(STAFF_ROLES),
  auditMiddleware(ShopActions.supportClose),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await closeConversation(requireTenant(req), id));
    } catch (error) {
      next(error);
    }
  },
);
