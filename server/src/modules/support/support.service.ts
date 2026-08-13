import { HttpStatus } from '@/shared/config';
import { ITenantContext } from '@/shared/types';
import { AppError, pickString, requireUuid } from '@/shared/utils';
import { notifySupportReply } from '@/modules/notifications';
import {
  insertConversation,
  insertMessage,
  markMessagesRead,
  selectConversationById,
  selectConversationPage,
  selectMessages,
  setConversationStatus,
} from '@/modules/support/support.db';
import {
  ConversationStatus,
  IConversationFilters,
  IConversationRow,
  IMessageRow,
  MessageAuthors,
  SupportErrors,
  SupportLimits,
  TMessageAuthor,
} from '@/modules/support/types';

const STATUSES: string[] = Object.values(ConversationStatus);

const buildCustomerName = (row: IConversationRow): string => {
  const parts = [row.customer_name, row.customer_last_name].filter(Boolean);

  return parts.length > 0 ? parts.join(' ') : (row.customer_email ?? 'Покупатель');
};

const mapConversation = (row: IConversationRow) => ({
  id: row.id,
  subject: row.subject,
  status: row.status,
  orderId: row.order_id,
  customerName: buildCustomerName(row),
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  unreadForShop: Number(row.unread_for_shop ?? 0),
  unreadForCustomer: Number(row.unread_for_customer ?? 0),
  lastText: row.last_text,
  lastMessageAt: row.last_message_at,
  createdAt: row.created_at,
});

const mapMessage = (row: IMessageRow) => ({
  id: row.id,
  author: row.author,
  authorName: row.author_name,
  text: row.text,
  unread: row.read_at === null,
  createdAt: row.created_at,
});

const pickText = (value: unknown): string => {
  const text = pickString(value).slice(0, SupportLimits.textMax);

  if (!text) {
    throw new AppError(SupportErrors.textRequired, HttpStatus.badRequest);
  }

  return text;
};

export const pickStatus = (value: unknown): string | null => {
  const status = pickString(value);

  return STATUSES.includes(status) ? status : null;
};

const requireConversation = async (
  tenant: ITenantContext,
  id: string,
  userId: string | null,
): Promise<IConversationRow> => {
  const row = await selectConversationById(tenant.id, id, userId);

  if (!row) {
    throw new AppError(SupportErrors.notFound, HttpStatus.notFound);
  }

  return row;
};

export const listConversations = async (
  tenant: ITenantContext,
  userId: string | null,
  filters: IConversationFilters,
  page: number,
  limit: number,
  offset: number,
) => {
  const { items, total } = await selectConversationPage(
    tenant.id,
    userId,
    filters,
    limit,
    offset,
  );

  return { items: items.map(mapConversation), total, page, limit };
};

export const getConversation = async (
  tenant: ITenantContext,
  id: string,
  userId: string | null,
) => {
  const row = await requireConversation(tenant, id, userId);

  return {
    conversation: mapConversation(row),
    messages: (await selectMessages(tenant.id, id)).map(mapMessage),
  };
};

export const startConversation = async (
  tenant: ITenantContext,
  userId: string,
  authorName: string | null,
  payload: Record<string, unknown>,
) => {
  const subject = pickString(payload.subject).slice(0, SupportLimits.subjectMax);
  const text = pickText(payload.text);
  const orderId = pickString(payload.orderId)
    ? requireUuid(payload.orderId, 'orderId')
    : null;

  if (!subject) {
    throw new AppError(SupportErrors.subjectRequired, HttpStatus.badRequest);
  }

  const created = await insertConversation(tenant.id, userId, subject, orderId);

  await insertMessage(tenant.id, created.id, MessageAuthors.customer, authorName, text);

  return getConversation(tenant, created.id, userId);
};

export const replyToConversation = async (
  tenant: ITenantContext,
  id: string,
  author: TMessageAuthor,
  authorName: string | null,
  payload: Record<string, unknown>,
  userId: string | null,
) => {
  const conversation = await requireConversation(tenant, id, userId);
  const text = pickText(payload.text);

  if (conversation.status === ConversationStatus.closed) {
    throw new AppError(SupportErrors.closed, HttpStatus.conflict);
  }

  await insertMessage(tenant.id, id, author, authorName, text);

  if (author === MessageAuthors.shop) {
    await notifySupportReply(tenant, conversation.user_id, conversation.subject);
  }

  return getConversation(tenant, id, userId);
};

export const readConversation = async (
  tenant: ITenantContext,
  id: string,
  author: TMessageAuthor,
  userId: string | null,
) => {
  await requireConversation(tenant, id, userId);

  return { changed: await markMessagesRead(tenant.id, id, author) };
};

export const closeConversation = async (tenant: ITenantContext, id: string) => {
  await requireConversation(tenant, id, null);

  await setConversationStatus(tenant.id, id, ConversationStatus.closed);

  return getConversation(tenant, id, null);
};
