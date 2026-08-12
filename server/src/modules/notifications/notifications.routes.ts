import { NextFunction, Response, Router } from 'express';
import { ErrorMessages, HttpStatus } from '@/shared/config';
import { authMiddleware } from '@/shared/middlewares';
import { IAppRequest } from '@/shared/types';
import { AppError, parsePagination, requireUuid, sendList, sendOk } from '@/shared/utils';
import {
  clearNotifications,
  listNotifications,
  pickNotificationKind,
  readAllNotifications,
  readNotification,
  removeNotification,
} from '@/modules/notifications/notifications.service';
import { NotificationPaths } from '@/modules/notifications/types';

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

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get(
  NotificationPaths.search,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const params = req.query as Record<string, unknown>;
      const { page, limit, offset } = parsePagination(params);
      const filters = { kind: pickNotificationKind(params.kind) };

      sendList(res, await listNotifications(
        requireTenant(req),
        requireUserId(req),
        filters,
        page,
        limit,
        offset,
      ));
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.patch(
  NotificationPaths.read,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await readNotification(requireTenant(req), requireUserId(req), id));
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.patch(
  NotificationPaths.readAll,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await readAllNotifications(requireTenant(req), requireUserId(req)));
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.delete(
  NotificationPaths.delete,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      const id = requireUuid(req.params.id, 'id');

      sendOk(res, await removeNotification(requireTenant(req), requireUserId(req), id));
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.delete(
  NotificationPaths.clearAll,
  async (req: IAppRequest, res: Response, next: NextFunction) => {
    try {
      sendOk(res, await clearNotifications(requireTenant(req), requireUserId(req)));
    } catch (error) {
      next(error);
    }
  },
);
