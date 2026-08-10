export interface IAdminAttribute {
  id: string;
  code: string;
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
  values: string[];
}

export interface IVariantRow {
  key: string;
  options: Record<string, string>;
  price: number | null;
  stock: number;
}

export interface IProductVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: number;
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
