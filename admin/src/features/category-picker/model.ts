export interface ICategoryDraft {
  id: string | null;
  name: string;
}

export interface ICategoryPickerHandlers {
  onCreateCategory: (name: string) => Promise<void>;
  onRenameCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const EMPTY_DRAFT: ICategoryDraft = { id: null, name: '' };

export const PickerTexts = {
  placeholder: 'Без категории',
  create: 'Новая категория',
  createTitle: 'Создание категории',
  renameTitle: 'Переименование категории',
  namePlaceholder: 'Например, Аксессуары',
  nameRequired: 'Введите название категории',
  deleteTitle: 'Удалить категорию?',
  deleteHint: 'Категорию можно удалить, только если в ней нет товаров и подкатегорий.',
  empty: 'Категорий пока нет — создайте первую',
} as const;
