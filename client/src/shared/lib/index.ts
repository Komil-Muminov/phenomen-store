import { Env } from '@/shared/config';

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

const UNIT_LABELS: Record<string, string> = {
  piece: 'шт',
  kg: 'кг',
  liter: 'л',
  pack: 'упак',
  meter: 'м',
};

const UNIT_STEPS: Record<string, number> = {
  piece: 1,
  kg: 0.1,
  liter: 0.5,
  pack: 1,
  meter: 0.5,
};

const UNIT_INITIAL: Record<string, number> = {
  piece: 1,
  kg: 0.5,
  liter: 1,
  pack: 1,
  meter: 1,
};

const PIECE_UNIT = 'piece';

const QUANTITY_PRECISION = 3;

export const unitLabel = (unit: string | undefined): string => UNIT_LABELS[unit ?? PIECE_UNIT] ?? 'шт';

export const unitStep = (unit: string | undefined): number => UNIT_STEPS[unit ?? PIECE_UNIT] ?? 1;

export const initialQuantity = (unit: string | undefined): number => (
  UNIT_INITIAL[unit ?? PIECE_UNIT] ?? 1
);

export const isWeightUnit = (unit: string | undefined): boolean => (unit ?? PIECE_UNIT) !== PIECE_UNIT;

export const roundQuantity = (value: number): number => (
  Number(value.toFixed(QUANTITY_PRECISION))
);

export const formatQuantity = (value: number, unit: string | undefined): string => {
  const rounded = roundQuantity(value);
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');

  return `${text} ${unitLabel(unit)}`;
};

export const formatUnitPrice = (
  value: number,
  currencySymbol: string,
  unit: string | undefined,
): string => (
  isWeightUnit(unit)
    ? `${formatPrice(value, currencySymbol)} / ${unitLabel(unit)}`
    : formatPrice(value, currencySymbol)
);

export const formatItemCount = (count: number): string => {
  const abs = Math.abs(count) % 100;
  const num = abs % 10;

  if (abs > 10 && abs < 20) return `${count} товаров`;
  if (num > 1 && num < 5) return `${count} товара`;
  if (num === 1) return `${count} товар`;

  return `${count} товаров`;
};

export const toHref = (path: unknown): never => path as never;

export * from './haptics';

const UPLOADS_MARK = '/uploads/';

export const resolveMediaUrl = (value: string | null | undefined): string => {
  const url = typeof value === 'string' ? value.trim() : '';
  const markIndex = url.indexOf(UPLOADS_MARK);

  return markIndex < 0 ? url : `${Env.apiUrl}${url.slice(markIndex)}`;
};

export const formatMoment = (value: string | Date | number | undefined | null): string => {
  if (!value) return '—';
  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else {
    let str = String(value).trim();
    // Replace space between date and time with T
    str = str.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2');
    // Truncate microseconds (.123456) to milliseconds (.123)
    str = str.replace(/(\.\d{3})\d+/, '$1');
    date = new Date(str);

    if (Number.isNaN(date.getTime())) {
      const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
      if (match) {
        date = new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4]),
          Number(match[5]),
        );
      }
    }
  }

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Сегодня, ${hours}:${minutes}`;
  }

  if (isYesterday) {
    return `Вчера, ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};
