import type { ITicket, ITicketMessage, ITicketThread, TTicketList } from '@contracts';

export type { ITicket, ITicketMessage, ITicketThread };

export type ITicketList = TTicketList;

export const TicketStatus = {
  open: 'open',
  answered: 'answered',
  closed: 'closed',
} as const;

export const TicketAuthors = {
  shop: 'shop',
  platform: 'platform',
} as const;

export const TicketStatusLabels: Record<string, string> = {
  [TicketStatus.open]: 'открыто',
  [TicketStatus.answered]: 'есть ответ',
  [TicketStatus.closed]: 'закрыто',
};

export const TicketStatusColors: Record<string, string> = {
  [TicketStatus.open]: 'gold',
  [TicketStatus.answered]: 'green',
  [TicketStatus.closed]: 'default',
};

export const TicketTopicLabels: Record<string, string> = {
  billing: 'Оплата и тариф',
  technical: 'Техническая проблема',
  content: 'Контент и товары',
  other: 'Другое',
};

export const TicketTopicOptions = Object.entries(TicketTopicLabels).map(([value, label]) => ({
  value,
  label,
}));

export const TicketStatusOptions = [
  { value: 'all', label: 'Все' },
  { value: TicketStatus.open, label: 'Открытые' },
  { value: TicketStatus.answered, label: 'С ответом' },
  { value: TicketStatus.closed, label: 'Закрытые' },
];

export const parseTicketFilter = (value: string): string | undefined => (
  value === 'all' ? undefined : value
);

export const formatTicketFilter = (value?: string): string => value ?? 'all';

export const formatTicketMoment = (value: string): string => (
  new Date(value).toLocaleString('ru-RU')
);
