const PRICE_LOCALE = 'ru-RU';

export const formatPrice = (value: number, currencySymbol: string): string => (
  `${new Intl.NumberFormat(PRICE_LOCALE, { maximumFractionDigits: 0 }).format(value)} ${currencySymbol}`
);

export const formatDiscount = (price: number, oldPrice: number | null): string | null => {
  if (!oldPrice || oldPrice <= price) {
    return null;
  }

  return `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
};

export const uniqueOptionValues = (
  variants: { options: Record<string, string> }[],
  code: string,
): string[] => Array.from(new Set(variants.map((variant) => variant.options[code]).filter(Boolean)));
