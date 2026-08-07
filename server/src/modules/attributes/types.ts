export const AttributePaths = {
  search: '/search',
  create: '/create',
  update: '/update/:id',
  deactivate: '/deactivate/:id',
} as const;

export const AttributeValueTypes = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
} as const;

export const AttributeErrors = {
  codeTaken: 'Характеристика с таким кодом уже существует',
  notFound: 'Характеристика не найдена',
  nameRequired: 'Укажите название характеристики',
} as const;

export const CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

export interface IAttributeRow {
  id: string;
  code: string;
  name: string;
  value_type: string;
  is_variant_option: boolean;
  is_filterable: boolean;
  position: number;
  values: string[];
}

export interface IAttribute {
  id: string;
  code: string;
  name: string;
  valueType: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
  values: string[];
}

export interface IAttributePreset {
  code: string;
  name: string;
  isVariantOption: boolean;
  position: number;
  values: string[];
}

const FASHION_PRESET: IAttributePreset[] = [
  { code: 'size', name: 'Размер', isVariantOption: true, position: 10, values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { code: 'color', name: 'Цвет', isVariantOption: true, position: 20, values: ['Белый', 'Чёрный', 'Серый', 'Синий', 'Бежевый'] },
  { code: 'material', name: 'Материал', isVariantOption: false, position: 30, values: ['Хлопок', 'Шерсть', 'Деним', 'Кожа', 'Синтетика'] },
  { code: 'season', name: 'Сезон', isVariantOption: false, position: 40, values: ['Лето', 'Зима', 'Демисезон', 'Всесезон'] },
];

const ELECTRONICS_PRESET: IAttributePreset[] = [
  { code: 'storage', name: 'Память', isVariantOption: true, position: 10, values: ['64 ГБ', '128 ГБ', '256 ГБ', '512 ГБ'] },
  { code: 'color', name: 'Цвет', isVariantOption: true, position: 20, values: ['Чёрный', 'Белый', 'Серебристый'] },
  { code: 'warranty', name: 'Гарантия', isVariantOption: false, position: 30, values: ['6 месяцев', '1 год', '2 года'] },
];

const GROCERY_PRESET: IAttributePreset[] = [
  { code: 'volume', name: 'Фасовка', isVariantOption: true, position: 10, values: ['0.5 л', '1 л', '1.5 л'] },
  { code: 'producer', name: 'Производитель', isVariantOption: false, position: 20, values: [] },
  { code: 'shelf_life', name: 'Срок годности', isVariantOption: false, position: 30, values: [] },
];

const UNIVERSAL_PRESET: IAttributePreset[] = [
  { code: 'variant', name: 'Исполнение', isVariantOption: true, position: 10, values: [] },
];

export const ATTRIBUTE_PRESETS: Record<string, IAttributePreset[]> = {
  fashion: FASHION_PRESET,
  electronics: ELECTRONICS_PRESET,
  grocery: GROCERY_PRESET,
  universal: UNIVERSAL_PRESET,
};
