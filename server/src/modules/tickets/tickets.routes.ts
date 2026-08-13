import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus, PlatformRoles, UserRoles } from '@/shared/config';
import { ShopActions, auditMiddleware } from '@/shared/audit';
import {
  authMiddleware,
  platformAuthMiddleware,
  platformRoleMiddleware,
  rbacMiddleware,
} from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
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
  closeTicket,
  getTicket,
  listTickets,
  pickTicketStatus,
  pickTicketTopic,
  readTicket,
  replyToTicket,
  startTicket,
} from '@/modules/tickets/tickets.service';
import { PlatformTicketPaths, TicketAuthors, TicketPaths } from '@/modules/tickets/types';

const OWNER_ROLES = [UserRoles.admin, UserRoles.owner, UserRoles.platform];

const PLATFORM_ROLES = [PlatformRoles.superadmin, PlatformRoles.operator];

const requireTenantId = (req: IAppRequest): string => {
  if (!req.tenant) {
    throw new AppError(ErrorMessages.tenantRequired, HttpStatus.badRequest);
  }

  return req.tenant.id;
};

const readActor = (req: IAppRequest): string => req.user?.login ?? req.platform?.login ?? '';

const readFilters = (req: IAppRequest) => {
  const params = req.query as Record<string, unknown>;

  return {
    pagination: parsePagination(params),
    filters: {
      search: pickSearch(params.search),
      status: pickTicketStatus(params.status),
      topic: pickTicketTopic(params.topic),
    },
  };
};

export const ticketRouter = Router();

ticketRouter.use(authMiddleware, rbacMiddleware(OWNER_ROLES));

ticketRouter.get(TicketPaths.search, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const { pagination, filters } = readFilters(req);

    sendList(res, await listTickets(
      requireTenantId(req),
      filters,
      pagination.page,
      pagination.limit,
      pagination.offset,
    ));
  } catch (error) {
    next(error);
  }
});

ticketRouter.post(
  TicketPaths.create,
  auditMiddleware(ShopActions.ticketCreate),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendCreated(res, await startTicket(requireTenantId(req), readActor(req), req.body ?? {}));
    } catch (error) {
      next(error);
    }
  },
);

ticketRouter.get(TicketPaths.get, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');
    const tenantId = requireTenantId(req);

    await readTicket(id, TicketAuthors.platform, tenantId);
    sendOk(res, await getTicket(id, tenantId));
  } catch (error) {
    next(error);
  }
});

ticketRouter.post(
  TicketPaths.reply,
  auditMiddleware(ShopActions.ticketReply),
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await replyToTicket(
        id,
        TicketAuthors.shop,
        readActor(req),
        req.body ?? {},
        requireTenantId(req),
      ));
    } catch (error) {
      next(error);
    }
  },
);

ticketRouter.patch(TicketPaths.read, async (req: IAppRequest, res: Response, next: NextFunction) => {
  try {
    const id = requireUuid(req.params.id, 'id');

    sendOk(res, await readTicket(id, TicketAuthors.platform, requireTenantId(req)));
  } catch (error) {
    next(error);
  }
});

export const platformTicketRouter = Router();

platformTicketRouter.use(platformAuthMiddleware, platformRoleMiddleware(PLATFORM_ROLES));

platformTicketRouter.get(
  PlatformTicketPaths.search,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const { pagination, filters } = readFilters(req);

      sendList(res, await listTickets(
        pickUuid((req.query as Record<string, unknown>).tenantId, 'tenantId'),
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

platformTicketRouter.get(
  PlatformTicketPaths.get,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      await readTicket(id, TicketAuthors.shop, null);
      sendOk(res, await getTicket(id, null));
    } catch (error) {
      next(error);
    }
  },
);

platformTicketRouter.post(
  PlatformTicketPaths.reply,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await replyToTicket(
        id,
        TicketAuthors.platform,
        readActor(req),
        req.body ?? {},
        null,
      ));
    } catch (error) {
      next(error);
    }
  },
);

platformTicketRouter.patch(
  PlatformTicketPaths.close,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await closeTicket(requireUuid(req.params.id, 'id')));
    } catch (error) {
      next(error);
    }
  },
);
