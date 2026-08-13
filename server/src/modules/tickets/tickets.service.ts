import { HttpStatus } from '@/shared/config';
import { AppError, pickString } from '@/shared/utils';
import {
  insertTicket,
  insertTicketMessage,
  markTicketMessagesRead,
  selectTicketById,
  selectTicketMessages,
  selectTicketPage,
  setTicketStatus,
} from '@/modules/tickets/tickets.db';
import {
  ITicketFilters,
  ITicketMessageRow,
  ITicketRow,
  TicketAuthors,
  TicketErrors,
  TicketLimits,
  TicketStatus,
  TicketTopics,
  TTicketAuthor,
} from '@/modules/tickets/types';

const STATUSES: string[] = Object.values(TicketStatus);

const TOPICS: string[] = Object.values(TicketTopics);

const mapTicket = (row: ITicketRow) => ({
  id: row.id,
  tenantId: row.tenant_id,
  tenantKey: row.tenant_key,
  tenantName: row.tenant_name,
  subject: row.subject,
  topic: row.topic,
  status: row.status,
  authorLogin: row.author_login,
  unreadForPlatform: Number(row.unread_for_platform ?? 0),
  unreadForShop: Number(row.unread_for_shop ?? 0),
  lastText: row.last_text,
  lastMessageAt: row.last_message_at,
  createdAt: row.created_at,
});

const mapMessage = (row: ITicketMessageRow) => ({
  id: row.id,
  author: row.author,
  authorName: row.author_name,
  text: row.text,
  unread: row.read_at === null,
  createdAt: row.created_at,
});

const pickText = (value: unknown): string => {
  const text = pickString(value).slice(0, TicketLimits.textMax);

  if (!text) {
    throw new AppError(TicketErrors.textRequired, HttpStatus.badRequest);
  }

  return text;
};

export const pickTicketStatus = (value: unknown): string | null => {
  const status = pickString(value);

  return STATUSES.includes(status) ? status : null;
};

export const pickTicketTopic = (value: unknown): string | null => {
  const topic = pickString(value);

  return TOPICS.includes(topic) ? topic : null;
};

const requireTicket = async (id: string, tenantId: string | null): Promise<ITicketRow> => {
  const row = await selectTicketById(id, tenantId);

  if (!row) {
    throw new AppError(TicketErrors.notFound, HttpStatus.notFound);
  }

  return row;
};

export const listTickets = async (
  tenantId: string | null,
  filters: ITicketFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectTicketPage(tenantId, filters, limit, offset);

  return { items: items.map(mapTicket), total, page, limit };
};

export const getTicket = async (id: string, tenantId: string | null) => {
  const row = await requireTicket(id, tenantId);

  return {
    ticket: mapTicket(row),
    messages: (await selectTicketMessages(id)).map(mapMessage),
  };
};

export const startTicket = async (
  tenantId: string,
  authorLogin: string,
  payload: Record<string, unknown>,
) => {
  const subject = pickString(payload.subject).slice(0, TicketLimits.subjectMax);
  const text = pickText(payload.text);
  const topic = pickTicketTopic(payload.topic) ?? TicketTopics.other;

  if (!subject) {
    throw new AppError(TicketErrors.subjectRequired, HttpStatus.badRequest);
  }

  const created = await insertTicket(tenantId, subject, topic, authorLogin);

  await insertTicketMessage(
    created.id,
    TicketAuthors.shop,
    authorLogin,
    text,
    TicketStatus.open,
  );

  return getTicket(created.id, tenantId);
};

export const replyToTicket = async (
  id: string,
  author: TTicketAuthor,
  authorName: string | null,
  payload: Record<string, unknown>,
  tenantId: string | null,
) => {
  const ticket = await requireTicket(id, tenantId);
  const text = pickText(payload.text);

  if (ticket.status === TicketStatus.closed) {
    throw new AppError(TicketErrors.closed, HttpStatus.conflict);
  }

  const nextStatus = author === TicketAuthors.platform
    ? TicketStatus.answered
    : TicketStatus.open;

  await insertTicketMessage(id, author, authorName, text, nextStatus);

  return getTicket(id, tenantId);
};

export const readTicket = async (
  id: string,
  author: TTicketAuthor,
  tenantId: string | null,
) => {
  await requireTicket(id, tenantId);

  return { changed: await markTicketMessagesRead(id, author) };
};

export const closeTicket = async (id: string) => {
  await requireTicket(id, null);

  await setTicketStatus(id, TicketStatus.closed);

  return getTicket(id, null);
};
