export const SupportPaths = {
  search: '/search',
  create: '/create',
  get: '/get/:id',
  reply: '/reply/:id',
  read: '/read/:id',
  manageSearch: '/manage/search',
  manageGet: '/manage/get/:id',
  manageReply: '/manage/reply/:id',
  manageClose: '/manage/close/:id',
} as const;

export const ConversationStatus = {
  open: 'open',
  closed: 'closed',
} as const;

export const MessageAuthors = {
  customer: 'customer',
  shop: 'shop',
} as const;

export type TMessageAuthor = (typeof MessageAuthors)[keyof typeof MessageAuthors];

export const SupportLimits = {
  subjectMax: 120,
  textMax: 2000,
} as const;

export const SupportErrors = {
  subjectRequired: 'Укажите тему обращения',
  textRequired: 'Напишите сообщение',
  notFound: 'Обращение не найдено',
  closed: 'Обращение закрыто — начните новое',
} as const;

export interface IConversationRow {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  status: string;
  last_message_at: string;
  created_at: string;
  customer_name: string | null;
  customer_last_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  unread_for_shop: string;
  unread_for_customer: string;
  last_text: string | null;
}

export interface IMessageRow {
  id: string;
  author: string;
  author_name: string | null;
  text: string;
  read_at: string | null;
  created_at: string;
}

export interface IConversationFilters {
  search: string | null;
  status: string | null;
}
