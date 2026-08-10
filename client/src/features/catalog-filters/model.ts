export const SortOptions = [
  { value: 'popular', label: 'Популярные' },
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
];

export const FacetLabels: Record<string, string> = {
  size: 'Размер',
  color: 'Цвет',
};

export type TFacets = Record<string, { value: string; total: number }[]>;

export type TSelectedFacets = Record<string, string[]>;

export const serializeFacets = (facets: TSelectedFacets): string => Object.entries(facets)
  .filter(([, values]) => values.length > 0)
  .map(([code, values]) => `${code}:${values.join(',')}`)
  .join(';');

export const toggleFacetValue = (
  facets: TSelectedFacets,
  code: string,
  value: string,
): TSelectedFacets => {
  const current = facets[code] ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return { ...facets, [code]: next };
};
export const countActiveFilters = (
  selectedFacets: TSelectedFacets,
  minPrice?: string,
  maxPrice?: string,
  sort?: string,
): number => {
  let count = Object.values(selectedFacets).reduce((acc, items) => acc + items.length, 0);

  if (minPrice && minPrice.trim() !== '') {
    count += 1;
  }
  if (maxPrice && maxPrice.trim() !== '') {
    count += 1;
  }
  if (sort && sort !== 'popular') {
    count += 1;
  }

  return count;
};
