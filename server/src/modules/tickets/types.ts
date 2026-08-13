export const TicketPaths = {
  search: '/search',
  create: '/create',
  get: '/get/:id',
  reply: '/reply/:id',
  read: '/read/:id',
} as const;

export const PlatformTicketPaths = {
  search: '/search',
  get: '/get/:id',
  reply: '/reply/:id',
  close: '/close/:id',
} as const;

export const TicketStatus = {
  open: 'open',
  answered: 'answered',
  closed: 'closed',
} as const;

export const TicketTopics = {
  billing: 'billing',
  technical: 'technical',
  content: 'content',
  other: 'other',
} as const;

export const TicketAuthors = {
  shop: 'shop',
  platform: 'platform',
} as const;

export type TTicketAuthor = (typeof TicketAuthors)[keyof typeof TicketAuthors];

export const TicketLimits = {
  subjectMax: 120,
  textMax: 4000,
} as const;

export const TicketErrors = {
  subjectRequired: 'Укажите тему обращения',
  textRequired: 'Напишите сообщение',
  notFound: 'Обращение не найдено',
  closed: 'Обращение закрыто — создайте новое',
} as const;

export interface ITicketRow {
  id: string;
  tenant_id: string;
  tenant_key: string;
  tenant_name: string;
  subject: string;
  topic: string;
  status: string;
  author_login: string;
  last_message_at: string;
  created_at: string;
  unread_for_platform: string;
  unread_for_shop: string;
  last_text: string | null;
}

export interface ITicketMessageRow {
  id: string;
  author: string;
  author_name: string | null;
  text: string;
  read_at: string | null;
  created_at: string;
}

export interface ITicketFilters {
  search: string | null;
  status: string | null;
  topic: string | null;
}
