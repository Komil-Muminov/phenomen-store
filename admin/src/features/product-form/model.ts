import type { IShopAttribute, IShopProduct } from '@/entities/shop';

export interface IVariantRow {
  key: string;
  options: Record<string, string>;
  price: number | null;
  stock: number;
}

export interface IProductFormValues {
  name: string;
  brand?: string;
  description?: string;
  basePrice: number;
  oldPrice?: number | null;
  categoryId?: string | null;
}

export interface IProductPayload extends IProductFormValues {
  attributes: Record<string, string>;
  variants: { options: Record<string, string>; price?: number; stock: number }[];
}

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
  const existing = previous.find((row) => row.key === key);

  return existing ?? { key, options, price: null, stock: 0 };
});

export const readSelectedOptions = (
  product: IShopProduct | null,
  optionCodes: string[],
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  optionCodes.forEach((code) => {
    const values = new Set<string>();

    (product?.variants ?? []).forEach((variant) => {
      const value = variant.options?.[code];

      if (value) {
        values.add(value);
      }
    });

    result[code] = Array.from(values);
  });

  return result;
};

export const readVariantRows = (product: IShopProduct | null): IVariantRow[] => (
  (product?.variants ?? []).map((variant) => ({
    key: buildRowKey(variant.options ?? {}),
    options: variant.options ?? {},
    price: variant.price,
    stock: variant.stock,
  }))
);

export const splitAttributes = (attributes: IShopAttribute[]) => ({
  options: attributes.filter((item) => item.isVariantOption),
  details: attributes.filter((item) => !item.isVariantOption),
});
