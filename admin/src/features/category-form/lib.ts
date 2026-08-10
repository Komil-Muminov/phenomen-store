import type { IShopCategory } from '@/entities/shop';

interface IOption {
  value: string;
  label: string;
}

export const HIDDEN_PARENT_LABEL = 'Скрытая категория';

export const buildParentOptions = (
  categories: IShopCategory[],
  editingId?: string,
  parentId?: string | null,
): IOption[] => {
  const options = categories
    .filter((item) => item.id !== editingId)
    .map((item) => ({ value: item.id, label: item.name }));

  return parentId && !options.some((option) => option.value === parentId)
    ? [{ value: parentId, label: HIDDEN_PARENT_LABEL }, ...options]
    : options;
};
