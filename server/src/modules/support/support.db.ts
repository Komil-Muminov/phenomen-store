import { tenantQuery } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import {
  IConversationFilters,
  IConversationRow,
  IMessageRow,
  MessageAuthors,
} from '@/modules/support/types';

const CONVERSATION_COLUMNS = `
  c.id, c.user_id, c.order_id, c.subject, c.status,
  c.last_message_at::text AS last_message_at,
  c.created_at::text AS created_at,
  u.name AS customer_name,
  u.last_name AS customer_last_name,
  u.email AS customer_email,
  u.phone AS customer_phone,
  (SELECT COUNT(*) FROM conversation_messages m
    WHERE m.conversation_id = c.id AND m.author = '${MessageAuthors.customer}'
      AND m.read_at IS NULL)::text AS unread_for_shop,
  (SELECT COUNT(*) FROM conversation_messages m
    WHERE m.conversation_id = c.id AND m.author = '${MessageAuthors.shop}'
      AND m.read_at IS NULL)::text AS unread_for_customer,
  (SELECT m.text FROM conversation_messages m
    WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_text
`;

const FROM = 'FROM conversations c JOIN users u ON u.id = c.user_id AND u.tenant_id = c.tenant_id';

export const insertConversation = async (
  tenantId: string,
  userId: string,
  subject: string,
  orderId: string | null,
): Promise<{ id: string }> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `INSERT INTO conversations (tenant_id, user_id, subject, order_id)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [tenantId, userId, subject, orderId],
  );

  return rows[0];
};

export const insertMessage = async (
  tenantId: string,
  conversationId: string,
  author: string,
  authorName: string | null,
  text: string,
): Promise<IMessageRow> => {
  const rows = await tenantQuery<IMessageRow>(
    tenantId,
    `INSERT INTO conversation_messages (tenant_id, conversation_id, author, author_name, text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, author, author_name, text,
               read_at::text AS read_at, created_at::text AS created_at`,
    [tenantId, conversationId, author, authorName, text],
  );

  await tenantQuery(
    tenantId,
    'UPDATE conversations SET last_message_at = now() WHERE tenant_id = $1 AND id = $2',
    [tenantId, conversationId],
  );

  return rows[0];
};

export const selectConversationPage = async (
  tenantId: string,
  userId: string | null,
  filters: IConversationFilters,
  limit: number,
  offset: number,
): Promise<{ items: IConversationRow[]; total: number }> => {
  const rows = await tenantQuery<TCounted<IConversationRow>>(
    tenantId,
    `SELECT ${CONVERSATION_COLUMNS}, COUNT(*) OVER()::text AS total_count
     ${FROM}
     WHERE c.tenant_id = $1
       AND ($2::uuid IS NULL OR c.user_id = $2)
       AND ($3::text IS NULL OR c.subject ILIKE $3 OR u.name ILIKE $3 OR u.email ILIKE $3)
       AND ($4::text IS NULL OR c.status = $4)
     ORDER BY c.last_message_at DESC
     LIMIT $5 OFFSET $6`,
    [tenantId, userId, filters.search, filters.status, limit, offset],
  );

  return splitTotal(rows);
};

export const selectConversationById = async (
  tenantId: string,
  id: string,
  userId: string | null,
): Promise<IConversationRow | null> => {
  const rows = await tenantQuery<IConversationRow>(
    tenantId,
    `SELECT ${CONVERSATION_COLUMNS} ${FROM}
     WHERE c.tenant_id = $1 AND c.id = $2 AND ($3::uuid IS NULL OR c.user_id = $3)
     LIMIT 1`,
    [tenantId, id, userId],
  );

  return rows[0] ?? null;
};

export const selectMessages = async (
  tenantId: string,
  conversationId: string,
): Promise<IMessageRow[]> => tenantQuery<IMessageRow>(
  tenantId,
  `SELECT id, author, author_name, text, read_at::text AS read_at, created_at::text AS created_at
   FROM conversation_messages
   WHERE tenant_id = $1 AND conversation_id = $2
   ORDER BY created_at`,
  [tenantId, conversationId],
);

export const markMessagesRead = async (
  tenantId: string,
  conversationId: string,
  author: string,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    `UPDATE conversation_messages SET read_at = now()
     WHERE tenant_id = $1 AND conversation_id = $2 AND author = $3 AND read_at IS NULL
     RETURNING id`,
    [tenantId, conversationId, author],
  );

  return rows.length;
};

export const setConversationStatus = async (
  tenantId: string,
  id: string,
  status: string,
): Promise<number> => {
  const rows = await tenantQuery<{ id: string }>(
    tenantId,
    'UPDATE conversations SET status = $3 WHERE tenant_id = $1 AND id = $2 RETURNING id',
    [tenantId, id, status],
  );

  return rows.length;
};
