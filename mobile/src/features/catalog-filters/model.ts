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
