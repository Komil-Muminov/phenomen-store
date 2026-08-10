import { IProductVariant, IVariantRow } from '@/features/product-options';

export interface IAdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string | null;
  price: number;
  oldPrice: number | null;
  categoryId: string | null;
  inStock: boolean;
  attributes: Record<string, string>;
  media: string[];
  variants: IProductVariant[];
  unit?: string;
}

export interface IAdminProductList {
  items: IAdminProduct[];
  total: number;
}

export interface IAdminCategory {
  id: string;
  slug: string;
  name: string;
}

export interface IProductFormValues {
  name: string;
  brand: string;
  description: string;
  basePrice: string;
  oldPrice: string;
  categoryId: string | null;
  unit: string;
  media: string[];
}

export const EMPTY_FORM: IProductFormValues = {
  name: '',
  brand: '',
  description: '',
  basePrice: '',
  oldPrice: '',
  categoryId: null,
  unit: 'piece',
  media: [],
};

export const ProductsTexts = {
  title: 'Товары',
  empty: 'Товаров пока нет',
  emptyFiltered: 'Ничего не найдено',
  searchPlaceholder: 'Название или бренд',
  create: 'Новый товар',
  edit: 'Редактирование товара',
  hide: 'Скрыть',
  loadMore: 'Показать ещё',
  save: 'Сохранить',
  cancel: 'Отмена',
  nameLabel: 'Название',
  priceLabel: 'Цена, смн',
  oldPriceLabel: 'Старая цена',
  brandLabel: 'Бренд',
  unitLabel: 'Единица',
  categoryLabel: 'Категория',
  descriptionLabel: 'Описание',
  mediaLabel: 'Фото',
  addPhoto: 'Добавить фото',
  noCategory: 'Без категории',
  newCategory: 'Новая категория',
  categoryNamePlaceholder: 'Например, Аксессуары',
  nameRequired: 'Введите название и цену',
  hidden: 'Товар скрыт',
  saved: 'Товар сохранён',
} as const;

export const toFormValues = (product: IAdminProduct): IProductFormValues => ({
  name: product.name,
  brand: product.brand ?? '',
  description: product.description ?? '',
  basePrice: String(product.price ?? ''),
  oldPrice: product.oldPrice === null ? '' : String(product.oldPrice),
  categoryId: product.categoryId,
  unit: product.unit ?? 'piece',
  media: product.media ?? [],
});

export const toPayload = (
  values: IProductFormValues,
  details: Record<string, string>,
  rows: IVariantRow[],
  hasVariants: boolean,
) => ({
  name: values.name.trim(),
  brand: values.brand.trim(),
  description: values.description.trim(),
  basePrice: Number(values.basePrice) || 0,
  oldPrice: values.oldPrice ? Number(values.oldPrice) : null,
  categoryId: values.categoryId,
  unit: values.unit,
  media: values.media,
  attributes: Object.entries(details).reduce<Record<string, string>>(
    (acc, [code, value]) => (value.trim() ? { ...acc, [code]: value.trim() } : acc),
    {},
  ),
  variants: hasVariants
    ? rows.map((row) => ({
      options: row.options,
      price: row.price ?? undefined,
      stock: row.stock,
    }))
    : [],
});

export const isFormValid = (values: IProductFormValues): boolean => (
  values.name.trim().length > 0 && Number(values.basePrice) > 0
);
