export { notificationsRouter } from '@/modules/notifications/notifications.routes';
export {
  createNotification,
  notifyOrderStatus,
  notifySupportReply,
} from '@/modules/notifications/notifications.service';
export { NotificationKinds } from '@/modules/notifications/types';
export type { INotificationInput, TNotificationKind } from '@/modules/notifications/types';
