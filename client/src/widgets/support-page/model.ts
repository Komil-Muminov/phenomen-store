export interface IConversation {
  id: string;
  subject: string;
  status: string;
  unreadForCustomer: number;
  lastText: string | null;
  lastMessageAt: string;
}

export interface IMessage {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface IConversationList {
  items: IConversation[];
  total: number;
}

export interface IThread {
  conversation: IConversation;
  messages: IMessage[];
}

export const ConversationStatus = {
  open: 'open',
  closed: 'closed',
} as const;

export const SupportTexts = {
  title: 'Поддержка',
  subtitle: 'Вопросы магазину',
  empty: 'Обращений пока нет',
  emptyHint: 'Напишите продавцу — ответ придёт сюда и в уведомления',
  newTitle: 'Новое обращение',
  subject: 'Тема',
  subjectPlaceholder: 'Например, вопрос по заказу',
  text: 'Сообщение',
  textPlaceholder: 'Опишите вопрос',
  send: 'Отправить',
  reply: 'Ответить',
  replyPlaceholder: 'Ваш ответ',
  create: 'Новое обращение',
  closed: 'Обращение закрыто',
  back: 'Назад',
  shopAuthor: 'Магазин',
  youAuthor: 'Вы',
} as const;

export const SUBJECT_MAX = 120;

export const TEXT_MAX = 2000;

export const isNewValid = (subject: string, text: string): boolean => (
  subject.trim().length > 0 && text.trim().length > 0
);
