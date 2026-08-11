import type { IBanner, TBannerList } from '@contracts';

export type IAdminBanner = IBanner;

export type IAdminBannerList = TBannerList;

export interface IBannerFormValues {
  imageUrl: string;
  title: string;
  subtitle: string;
  actionType: string;
  actionValue: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export const BannerActionTypes = {
  none: 'none',
  category: 'category',
  product: 'product',
  link: 'link',
} as const;

export const BannerActionOptions = [
  { value: BannerActionTypes.none, label: 'Без перехода' },
  { value: BannerActionTypes.category, label: 'В категорию' },
  { value: BannerActionTypes.product, label: 'На товар' },
  { value: BannerActionTypes.link, label: 'Ссылка' },
] as const;

export const EMPTY_BANNER: IBannerFormValues = {
  imageUrl: '',
  title: '',
  subtitle: '',
  actionType: BannerActionTypes.none,
  actionValue: null,
  startsAt: '',
  endsAt: '',
  isActive: true,
};

const DATE_LENGTH = 10;

export const maskDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];

  return parts.filter((part) => part.length > 0).join('.');
};

export const isDateFilled = (value: string): boolean => value.length === DATE_LENGTH;

export const isDateValid = (value: string): boolean => {
  if (!value) {
    return true;
  }

  if (!isDateFilled(value)) {
    return false;
  }

  const [day, month, year] = value.split('.').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
};

export const toIsoDate = (value: string, endOfDay: boolean): string | null => {
  if (!isDateValid(value) || !value) {
    return null;
  }

  const [day, month, year] = value.split('.').map(Number);
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.toISOString();
};

export const fromIsoDate = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getFullYear()),
  ].join('.');
};

export const BannersTexts = {
  title: 'Баннеры',
  subtitle: 'Карусель на главной приложения',
  empty: 'Баннеров пока нет',
  create: 'Новый баннер',
  edit: 'Изменение баннера',
  loadMore: 'Показать ещё',
  save: 'Сохранить',
  cancel: 'Отмена',
  imageLabel: 'Картинка',
  addImage: 'Выбрать файл',
  replaceImage: 'Заменить',
  imageRequired: 'Прикрепите картинку баннера',
  titleLabel: 'Заголовок',
  subtitleLabel: 'Подзаголовок',
  actionLabel: 'Переход',
  linkPlaceholder: 'https://',
  visibleLabel: 'Показывать в карусели',
  periodLabel: 'Период показа',
  periodFrom: 'С даты',
  periodTo: 'По дату',
  periodHint: 'Пусто — баннер показывается всегда. Формат ДД.ММ.ГГГГ',
  hidden: 'скрыт',
  visible: 'виден',
  deleteTitle: 'Удалить баннер?',
} as const;

export const toBannerForm = (banner: IAdminBanner): IBannerFormValues => ({
  imageUrl: banner.imageUrl,
  title: banner.title ?? '',
  subtitle: banner.subtitle ?? '',
  actionType: banner.actionType,
  actionValue: banner.actionValue,
  startsAt: fromIsoDate(banner.startsAt),
  endsAt: fromIsoDate(banner.endsAt),
  isActive: banner.isActive,
});

export const toBannerPayload = (values: IBannerFormValues, position: number) => ({
  imageUrl: values.imageUrl.trim(),
  title: values.title.trim() ? values.title.trim() : null,
  subtitle: values.subtitle.trim() ? values.subtitle.trim() : null,
  actionType: values.actionType,
  actionValue: values.actionType === BannerActionTypes.none
    ? null
    : (values.actionValue ?? null),
  position,
  startsAt: toIsoDate(values.startsAt, false),
  endsAt: toIsoDate(values.endsAt, true),
  isActive: values.isActive,
});

export interface IBannerMove {
  id: string;
  beforeId?: string;
  afterId?: string;
}

export const buildMove = (
  items: IAdminBanner[],
  from: number,
  offset: number,
): IBannerMove | null => {
  const to = from + offset;

  if (to < 0 || to >= items.length) {
    return null;
  }

  return offset > 0
    ? { id: items[from].id, afterId: items[to].id }
    : { id: items[from].id, beforeId: items[to].id };
};
