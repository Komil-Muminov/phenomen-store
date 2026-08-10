export interface IAdminBanner {
  id: string;
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

export interface IAdminBannerList {
  items: IAdminBanner[];
  total: number;
  page: number;
  limit: number;
}

export interface IBannerFormValues {
  imageUrl: string;
  title: string;
  subtitle: string;
  actionType: string;
  actionValue: string | null;
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
  isActive: true,
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
  hidden: 'скрыт',
  visible: 'виден',
  deleteTitle: 'Удалить баннер?',
  reorderHint: 'Порядок меняется стрелками на первой странице без фильтров',
} as const;

export const toBannerForm = (banner: IAdminBanner): IBannerFormValues => ({
  imageUrl: banner.imageUrl,
  title: banner.title ?? '',
  subtitle: banner.subtitle ?? '',
  actionType: banner.actionType,
  actionValue: banner.actionValue,
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
  startsAt: null,
  endsAt: null,
  isActive: values.isActive,
});

export const swapItems = <T,>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) {
    return items;
  }

  const next = [...items];
  const moved = next[from];

  next[from] = next[to];
  next[to] = moved;

  return next;
};
