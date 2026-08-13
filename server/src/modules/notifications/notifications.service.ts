import { ErrorMessages, HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString } from '@/shared/utils';
import {
  countUnread,
  deleteAllNotifications,
  deleteNotificationById,
  insertNotification,
  markAllRead,
  markRead,
  selectNotificationPage,
} from '@/modules/notifications/notifications.db';
import {
  INotificationFilters,
  INotificationInput,
  INotificationRow,
  NotificationKinds,
  NotificationTexts,
  OrderStatusLabels,
  TNotificationKind,
} from '@/modules/notifications/types';

const KINDS: string[] = Object.values(NotificationKinds);

const mapNotification = (row: INotificationRow) => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  text: row.text,
  actionUrl: row.action_url,
  unread: row.read_at === null,
  createdAt: row.created_at,
});

export const pickNotificationKind = (value: unknown): string | null => {
  const kind = pickString(value);

  return KINDS.includes(kind) ? kind : null;
};

export const listNotifications = async (
  tenant: ITenantContext,
  userId: string,
  filters: INotificationFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectNotificationPage(tenant.id, userId, filters, limit, offset);

  return {
    items: items.map(mapNotification),
    total,
    page,
    limit,
    unreadCount: await countUnread(tenant.id, userId),
  };
};

export const createNotification = async (
  tenant: ITenantContext,
  input: INotificationInput,
) => mapNotification(await insertNotification(tenant.id, input));

export const readNotification = async (tenant: ITenantContext, userId: string, id: string) => {
  const changed = await markRead(tenant.id, userId, id);

  return { changed: changed > 0 };
};

export const readAllNotifications = async (tenant: ITenantContext, userId: string) => ({
  changed: await markAllRead(tenant.id, userId),
});

export const removeNotification = async (tenant: ITenantContext, userId: string, id: string) => {
  const removed = await deleteNotificationById(tenant.id, userId, id);

  if (removed === 0) {
    throw new AppError(ErrorMessages.notFound, HttpStatus.notFound);
  }

  return { removed: true };
};

export const clearNotifications = async (tenant: ITenantContext, userId: string) => ({
  removed: await deleteAllNotifications(tenant.id, userId),
});

export const notifySupportReply = async (
  tenant: ITenantContext,
  userId: string,
  subject: string,
): Promise<void> => {
  await insertNotification(tenant.id, {
    userId,
    kind: NotificationKinds.system as TNotificationKind,
    title: NotificationTexts.supportReplyTitle,
    text: NotificationTexts.supportReplyBody(subject),
    actionUrl: NotificationTexts.supportActionUrl,
  });
};

export const notifyReviewReply = async (
  tenant: ITenantContext,
  userId: string | null,
  productName: string,
): Promise<void> => {
  if (!userId) {
    return;
  }

  await insertNotification(tenant.id, {
    userId,
    kind: NotificationKinds.system as TNotificationKind,
    title: NotificationTexts.reviewReplyTitle,
    text: NotificationTexts.reviewReplyBody(productName),
    actionUrl: NotificationTexts.reviewActionUrl,
  });
};

export const notifyOrderStatus = async (
  tenant: ITenantContext,
  userId: string | null,
  orderNumber: string,
  status: string,
): Promise<void> => {
  if (!userId) {
    return;
  }

  await insertNotification(tenant.id, {
    userId,
    kind: NotificationKinds.order as TNotificationKind,
    title: NotificationTexts.orderStatusTitle(orderNumber),
    text: NotificationTexts.orderStatusBody(OrderStatusLabels[status] ?? status),
    actionUrl: NotificationTexts.orderActionUrl,
  });
};
