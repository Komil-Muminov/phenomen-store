export interface IImportRow {
  name: string;
  price: number;
  oldPrice?: number;
  category?: string;
  brand?: string;
  description?: string;
  unit?: string;
  slug?: string;
  media?: string[];
}

export interface IImportResult {
  created: number;
  updated: number;
  failed: { row: number; name: string; reason: string }[];
}

const HEADER_ALIASES: Record<string, string> = {
  название: 'name',
  наименование: 'name',
  товар: 'name',
  name: 'name',
  цена: 'price',
  price: 'price',
  'старая цена': 'oldPrice',
  oldprice: 'oldPrice',
  категория: 'category',
  category: 'category',
  бренд: 'brand',
  brand: 'brand',
  описание: 'description',
  description: 'description',
  единица: 'unit',
  unit: 'unit',
  ключ: 'slug',
  slug: 'slug',
  картинки: 'media',
  media: 'media',
  фото: 'media',
};

const splitLine = (line: string, separator: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      quoted = !quoted;
    } else if (char === separator && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());

  return cells;
};

const detectSeparator = (line: string): string => {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;

  return semicolons >= commas ? ';' : ',';
};

const readNumber = (value: string): number => {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));

  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseCsv = (text: string): { rows: IImportRow[]; unknown: string[] } => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { rows: [], unknown: [] };
  }

  const separator = detectSeparator(lines[0]);
  const rawHeaders = splitLine(lines[0], separator).map((item) => item.toLowerCase());
  const headers = rawHeaders.map((item) => HEADER_ALIASES[item] ?? '');
  const unknown = rawHeaders.filter((item, index) => !headers[index] && item.length > 0);

  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line, separator);
    const entry: Record<string, string> = {};

    headers.forEach((key, index) => {
      if (key) {
        entry[key] = cells[index] ?? '';
      }
    });

    return {
      name: entry.name ?? '',
      price: readNumber(entry.price ?? '0'),
      oldPrice: entry.oldPrice ? readNumber(entry.oldPrice) : undefined,
      category: entry.category || undefined,
      brand: entry.brand || undefined,
      description: entry.description || undefined,
      unit: entry.unit || undefined,
      slug: entry.slug || undefined,
      media: entry.media ? entry.media.split('|').map((item) => item.trim()).filter(Boolean) : undefined,
    };
  }).filter((row) => row.name.length > 0);

  return { rows, unknown };
};

export const buildTemplate = (): string => [
  'название;цена;старая цена;категория;бренд;описание;единица;картинки',
  'Футболка базовая;199;249;Женщинам;PHENOMEN;Хлопок 100%;piece;https://example.com/1.jpg',
  'Сыр гауда;89;;Продукты;;Вес указан за килограмм;kg;',
].join('\n');
