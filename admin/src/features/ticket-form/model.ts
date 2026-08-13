export interface ITicketValues {
  subject: string;
  topic: string;
  text: string;
}

export const TicketFormTexts = {
  title: 'Новое обращение в поддержку',
  open: 'Написать в поддержку',
  subject: 'Тема',
  subjectPlaceholder: 'Коротко о проблеме',
  topic: 'Раздел',
  text: 'Сообщение',
  textPlaceholder: 'Опишите ситуацию подробно',
  submit: 'Отправить',
  cancel: 'Отмена',
} as const;

export const TicketFormLimits = {
  subjectMax: 120,
  textMax: 4000,
} as const;
