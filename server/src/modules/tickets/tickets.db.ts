import { query } from '@/shared/db';
import { TCounted } from '@/shared/types';
import { splitTotal } from '@/shared/utils';
import {
  ITicketFilters,
  ITicketMessageRow,
  ITicketRow,
  TicketAuthors,
} from '@/modules/tickets/types';

const TICKET_COLUMNS = `
  t.id, t.tenant_id, t.subject, t.topic, t.status, t.author_login,
  t.last_message_at::text AS last_message_at,
  t.created_at::text AS created_at,
  s.key AS tenant_key,
  s.name AS tenant_name,
  (SELECT COUNT(*) FROM platform_ticket_messages m
    WHERE m.ticket_id = t.id AND m.author = '${TicketAuthors.shop}'
      AND m.read_at IS NULL)::text AS unread_for_platform,
  (SELECT COUNT(*) FROM platform_ticket_messages m
    WHERE m.ticket_id = t.id AND m.author = '${TicketAuthors.platform}'
      AND m.read_at IS NULL)::text AS unread_for_shop,
  (SELECT m.text FROM platform_ticket_messages m
    WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_text
`;

const FROM = 'FROM platform_tickets t JOIN tenants s ON s.id = t.tenant_id';

export const insertTicket = async (
  tenantId: string,
  subject: string,
  topic: string,
  authorLogin: string,
): Promise<{ id: string }> => {
  const rows = await query<{ id: string }>(
    `INSERT INTO platform_tickets (tenant_id, subject, topic, author_login)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [tenantId, subject, topic, authorLogin],
  );

  return rows[0];
};

export const insertTicketMessage = async (
  ticketId: string,
  author: string,
  authorName: string | null,
  text: string,
  status: string,
): Promise<ITicketMessageRow> => {
  const rows = await query<ITicketMessageRow>(
    `INSERT INTO platform_ticket_messages (ticket_id, author, author_name, text)
     VALUES ($1, $2, $3, $4)
     RETURNING id, author, author_name, text,
               read_at::text AS read_at, created_at::text AS created_at`,
    [ticketId, author, authorName, text],
  );

  await query(
    'UPDATE platform_tickets SET last_message_at = now(), status = $2 WHERE id = $1',
    [ticketId, status],
  );

  return rows[0];
};

export const selectTicketPage = async (
  tenantId: string | null,
  filters: ITicketFilters,
  limit: number,
  offset: number,
): Promise<{ items: ITicketRow[]; total: number }> => {
  const rows = await query<TCounted<ITicketRow>>(
    `SELECT ${TICKET_COLUMNS}, COUNT(*) OVER()::text AS total_count
     ${FROM}
     WHERE ($1::uuid IS NULL OR t.tenant_id = $1)
       AND ($2::text IS NULL OR t.subject ILIKE $2 OR s.name ILIKE $2 OR s.key ILIKE $2)
       AND ($3::text IS NULL OR t.status = $3)
       AND ($4::text IS NULL OR t.topic = $4)
     ORDER BY t.last_message_at DESC
     LIMIT $5 OFFSET $6`,
    [tenantId, filters.search, filters.status, filters.topic, limit, offset],
  );

  return splitTotal(rows);
};

export const selectTicketById = async (
  id: string,
  tenantId: string | null,
): Promise<ITicketRow | null> => {
  const rows = await query<ITicketRow>(
    `SELECT ${TICKET_COLUMNS} ${FROM}
     WHERE t.id = $1 AND ($2::uuid IS NULL OR t.tenant_id = $2)
     LIMIT 1`,
    [id, tenantId],
  );

  return rows[0] ?? null;
};

export const selectTicketMessages = async (
  ticketId: string,
): Promise<ITicketMessageRow[]> => query<ITicketMessageRow>(
  `SELECT id, author, author_name, text, read_at::text AS read_at, created_at::text AS created_at
   FROM platform_ticket_messages
   WHERE ticket_id = $1
   ORDER BY created_at`,
  [ticketId],
);

export const markTicketMessagesRead = async (
  ticketId: string,
  author: string,
): Promise<number> => {
  const rows = await query<{ id: string }>(
    `UPDATE platform_ticket_messages SET read_at = now()
     WHERE ticket_id = $1 AND author = $2 AND read_at IS NULL
     RETURNING id`,
    [ticketId, author],
  );

  return rows.length;
};

export const setTicketStatus = async (id: string, status: string): Promise<number> => {
  const rows = await query<{ id: string }>(
    'UPDATE platform_tickets SET status = $2 WHERE id = $1 RETURNING id',
    [id, status],
  );

  return rows.length;
};
