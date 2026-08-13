export interface IConversation {
  id: string;
  subject: string;
  status: string;
  orderId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  unreadForShop: number;
  unreadForCustomer: number;
  lastText: string | null;
  lastMessageAt: string;
  createdAt: string;
}

export interface IMessage {
  id: string;
  author: string;
  authorName: string | null;
  text: string;
  unread: boolean;
  createdAt: string;
}

export interface IConversationList {
  items: IConversation[];
  total: number;
  page: number;
  limit: number;
}

export interface IThread {
  conversation: IConversation;
  messages: IMessage[];
}

export const ConversationStatus = {
  open: 'open',
  closed: 'closed',
} as const;

export const StatusOptions = [
  { value: 'all', label: 'Все' },
  { value: ConversationStatus.open, label: 'Открытые' },
  { value: ConversationStatus.closed, label: 'Закрытые' },
];

export const SupportTexts = {
  title: 'Обращения',
  subtitle: 'Вопросы покупателей',
  searchPlaceholder: 'Тема, имя или почта',
  empty: 'Обращений пока нет',
  emptyThread: 'Выберите обращение слева',
  reply: 'Ответить',
  replyPlaceholder: 'Напишите ответ покупателю',
  close: 'Закрыть обращение',
  closed: 'Обращение закрыто',
  sent: 'Ответ отправлен',
  statusOpen: 'открыто',
  statusClosed: 'закрыто',
  shopAuthor: 'Магазин',
} as const;

export const parseStatus = (value: string): string | undefined => (
  value === 'all' ? undefined : value
);

export const formatStatus = (value?: string): string => value ?? 'all';
