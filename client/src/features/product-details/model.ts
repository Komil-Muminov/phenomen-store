import { IProduct, IProductVariant } from '@/entities/product';

export interface ISelectedOptions {
  size: string | null;
  color: string | null;
}

export const OptionLabels: Record<string, string> = {
  size: 'Размер',
  color: 'Цвет',
};

export const AttributeLabels: Record<string, string> = {
  material: 'Состав',
  season: 'Сезон',
  fit: 'Посадка',
};

export const StockMessages = {
  inStock: 'В наличии',
  outOfStock: 'Нет в наличии',
  selectOptions: 'Выберите размер и цвет',
};

export const findVariant = (
  product: IProduct,
  selected: ISelectedOptions,
): IProductVariant | null => product.variants.find((variant) => (
  (!selected.size || variant.options.size === selected.size)
  && (!selected.color || variant.options.color === selected.color)
)) ?? null;

export const isOptionAvailable = (
  product: IProduct,
  code: keyof ISelectedOptions,
  value: string,
  selected: ISelectedOptions,
): boolean => product.variants.some((variant) => {
  const otherCode = code === 'size' ? 'color' : 'size';
  const otherValue = selected[otherCode];

  return variant.options[code] === value
    && variant.stock > 0
    && (!otherValue || variant.options[otherCode] === otherValue);
});
