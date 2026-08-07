export interface IBannerRow {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  action_type: string;
  action_value: string | null;
  position: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface IBannerInput {
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  actionType: string;
  actionValue: string | null;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export const BannerActionTypes = {
  none: 'none',
  category: 'category',
  product: 'product',
  link: 'link',
} as const;

export type TBannerActionType = (typeof BannerActionTypes)[keyof typeof BannerActionTypes];

export const BannerPaths = {
  manageSearch: '/manage/search',
} as const;

export const BannerDefaults = {
  position: 100,
  sectionPosition: 10,
} as const;

export const BannerErrors = {
  imageRequired: 'Укажите ссылку на картинку баннера',
  imageInvalid: 'Ссылка на картинку должна начинаться с http:// или https://',
  actionInvalid: 'Неизвестный тип перехода',
  linkInvalid: 'Ссылка перехода должна начинаться с http:// или https://',
  targetRequired: 'Выберите категорию или товар для перехода',
  targetNotFound: 'Категория или товар не найдены в этом магазине',
  datesInvalid: 'Дата окончания показа раньше даты начала',
} as const;

export const UrlPattern = /^https?:\/\/[^\s]+$/i;

export const MaxUrlLength = 2048;

export const MaxTextLength = 120;
