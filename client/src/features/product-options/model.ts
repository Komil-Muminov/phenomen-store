import type { IAttribute, IProductVariant } from '@contracts';

export type { IProductVariant };

export type IAdminAttribute = IAttribute;

export interface IVariantRow {
  key: string;
  options: Record<string, string>;
  price: number | null;
  stock: number;
}

export const OptionsTexts = {
  attributesTitle: 'Характеристики',
  attributesEmpty: 'Характеристик пока нет',
  variantsTitle: 'Товар бывает в разных вариантах',
  variantsEmpty: 'Нет характеристик для вариантов',
  combinations: 'Комбинаций',
  priceHint: 'Пустая цена — берётся цена товара',
  pricePlaceholder: 'цена',
  stockPlaceholder: 'остаток',
  valuePlaceholder: 'Выберите или впишите',
  newValue: 'Новое значение',
} as const;

export const buildRowKey = (options: Record<string, string>): string => (
  Object.keys(options).sort().map((code) => `${code}:${options[code]}`).join('|')
);

export const buildMatrix = (
  optionCodes: string[],
  selected: Record<string, string[]>,
): Record<string, string>[] => {
  const active = optionCodes.filter((code) => (selected[code] ?? []).length > 0);

  if (active.length === 0) {
    return [];
  }

  return active.reduce<Record<string, string>[]>(
    (rows, code) => rows.flatMap(
      (row) => (selected[code] ?? []).map((value) => ({ ...row, [code]: value })),
    ),
    [{}],
  );
};

export const mergeRows = (
  matrix: Record<string, string>[],
  previous: IVariantRow[],
): IVariantRow[] => matrix.map((options) => {
  const key = buildRowKey(options);

  return previous.find((row) => row.key === key) ?? { key, options, price: null, stock: 0 };
});

export const readSelectedOptions = (
  variants: IProductVariant[],
  optionCodes: string[],
): Record<string, string[]> => optionCodes.reduce<Record<string, string[]>>((acc, code) => {
  const values = new Set<string>();

  variants.forEach((variant) => {
    const value = variant.options?.[code];

    if (value) {
      values.add(value);
    }
  });

  return { ...acc, [code]: Array.from(values) };
}, {});

export const readVariantRows = (variants: IProductVariant[]): IVariantRow[] => variants.map(
  (variant) => ({
    key: buildRowKey(variant.options ?? {}),
    options: variant.options ?? {},
    price: variant.price,
    stock: variant.stock,
  }),
);

export const splitAttributes = (attributes: IAdminAttribute[]) => ({
  options: attributes.filter((item) => item.isVariantOption),
  details: attributes.filter((item) => !item.isVariantOption),
});

export const toggleValue = (values: string[], value: string): string[] => (
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
);

export interface IAttributeDraft {
  id: string | null;
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: string;
}

export interface IAttributePayload {
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
}

export interface IAttributeHandlers {
  onCreateAttribute: (payload: IAttributePayload) => void;
  onUpdateAttribute: (id: string, payload: IAttributePayload) => void;
  onDeleteAttribute: (id: string) => void;
}

export const DEFAULT_ATTRIBUTE_POSITION = 100;

export const AttributeTexts = {
  addDetail: 'Характеристика',
  addOption: 'Вариант',
  createTitle: 'Новая характеристика',
  editTitle: 'Характеристика',
  nameLabel: 'Название',
  detailPlaceholder: 'Например, Материал',
  optionPlaceholder: 'Например, Размер',
  kindLabel: 'Как использовать',
  kindOption: 'Для вариантов',
  kindDetail: 'Просто описание',
  filterableLabel: 'Участвует в фильтрах каталога',
  positionLabel: 'Порядок',
  positionHint: 'Меньше число — выше в карточке',
  save: 'Сохранить',
  cancel: 'Отмена',
  deleteTitle: 'Удалить характеристику?',
  deleteHint: 'Если она заполнена в товарах, удаление будет отклонено',
} as const;

export const emptyAttributeDraft = (isVariantOption: boolean): IAttributeDraft => ({
  id: null,
  name: '',
  isVariantOption,
  isFilterable: true,
  position: String(DEFAULT_ATTRIBUTE_POSITION),
});

export const toAttributeDraft = (attribute: IAdminAttribute): IAttributeDraft => ({
  id: attribute.id,
  name: attribute.name,
  isVariantOption: attribute.isVariantOption,
  isFilterable: attribute.isFilterable,
  position: String(attribute.position ?? DEFAULT_ATTRIBUTE_POSITION),
});

export const toAttributePayload = (draft: IAttributeDraft): IAttributePayload => ({
  name: draft.name.trim(),
  isVariantOption: draft.isVariantOption,
  isFilterable: draft.isFilterable,
  position: Number(draft.position) || DEFAULT_ATTRIBUTE_POSITION,
});
