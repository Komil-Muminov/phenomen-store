import { tenantQuery } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import {
  INotificationFilters,
  INotificationInput,
  INotificationRow,
} from '@/modules/notifications/types';

const COLUMNS = `id, kind, title, text, action_url,
  read_at::text AS read_at, created_at::text AS created_at`;

const FILTER = `
  WHERE tenant_id = $1
    AND user_id = $2
    AND ($3::text IS NULL OR kind = $3::text)
`;

export const insertNotification = async (
  tenantId: string,
  input: INotificationInput,
): Promise<INotificationRow> => {
  const rows = await tenantQuery<INotificationRow>(
    tenantId,
    `INSERT INTO notifications (tenant_id, user_id, kind, title, text, action_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [tenantId, input.userId, input.kind, input.title, input.text, input.actionUrl ?? null],
  );

  return rows[0];
};

export const selectNotificationPage = async (
  tenantId: string,
  userId: string,
  filters: INotificationFilters,
  limit: number,
  offset: number,
): Promise<{ items: INotificationRow[]; total: number }> => {
  const rows = await tenantQuery<TCounted<INotificationRow>>(
    tenantId,
    `SELECT ${COLUMNS}, COUNT(*) OVER()::text AS total_count
     FROM notifications ${FILTER}
     ORDER BY created_at DESC
     LIMIT $4 OFFSET $5`,
    [tenantId, userId, filters.kind, limit, offset],
  );

  return splitTotal(rows);
};

export const countUnread = async (tenantId: string, userId: string): Promise<number> => {
  const rows = await tenantQuery<{ total: string }>(
    tenantId,
    `SELECT COUNT(*)::text AS total FROM notifications
     WHERE tenant_id = $1 AND user_id = $2 AND read_at IS NULL`,
    [tenantId, userId],
  );

  return Number(rows[0]?.total ?? 0);
};

export const markRead = async (
  tenantId: string,
  userId: string,
  id: string,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `UPDATE notifications SET read_at = now()
     WHERE tenant_id = $1 AND user_id = $2 AND id = $3 AND read_at IS NULL
     RETURNING id`,
    [tenantId, userId, id],
  );

  return rows.length;
};

export const markAllRead = async (tenantId: string, userId: string): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `UPDATE notifications SET read_at = now()
     WHERE tenant_id = $1 AND user_id = $2 AND read_at IS NULL
     RETURNING id`,
    [tenantId, userId],
  );

  return rows.length;
};

export const deleteNotificationById = async (
  tenantId: string,
  userId: string,
  id: string,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'DELETE FROM notifications WHERE tenant_id = $1 AND user_id = $2 AND id = $3 RETURNING id',
    [tenantId, userId, id],
  );

  return rows.length;
};

export const deleteAllNotifications = async (
  tenantId: string,
  userId: string,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'DELETE FROM notifications WHERE tenant_id = $1 AND user_id = $2 RETURNING id',
    [tenantId, userId],
  );

  return rows.length;
};
