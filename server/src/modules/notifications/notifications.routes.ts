import { Router } from 'express';
import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from './notifications.service';

export const notificationsRouter = Router();

notificationsRouter.get('/get', async (req: any, res: any, next: any) => {
  try {
    const tenantId = req.tenant.id;
    const kind = req.query.kind as string | undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const data = await getNotifications(tenantId, kind, page, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.all('/delete/:id', async (req: any, res: any, next: any) => {
  try {
    const tenantId = req.tenant.id;
    const { id } = req.params;

    const data = await deleteNotification(tenantId, id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.all('/clear-all', async (req: any, res: any, next: any) => {
  try {
    const tenantId = req.tenant.id;

    const data = await clearAllNotifications(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.all('/read/:id', async (req: any, res: any, next: any) => {
  try {
    const tenantId = req.tenant.id;
    const { id } = req.params;

    const data = await markNotificationRead(tenantId, id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
