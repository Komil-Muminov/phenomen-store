export interface ICategoryDraft {
  id: string | null;
  name: string;
  parentId: string | null;
  imageUrl: string;
  position: number;
  isActive: boolean;
}

export interface ICategoryPayload {
  name: string;
  parentId: string | null;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
}

export interface ICategoryPickerHandlers {
  onCreateCategory: (payload: ICategoryPayload) => Promise<void>;
  onUpdateCategory: (id: string, payload: ICategoryPayload) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const DEFAULT_POSITION = 100;

export const EMPTY_DRAFT: ICategoryDraft = {
  id: null,
  name: '',
  parentId: null,
  imageUrl: '',
  position: DEFAULT_POSITION,
  isActive: true,
};

export const toDraftPayload = (draft: ICategoryDraft): ICategoryPayload => ({
  name: draft.name.trim(),
  parentId: draft.parentId,
  imageUrl: draft.imageUrl.trim() || null,
  position: draft.position,
  isActive: draft.isActive,
});

export const PickerTexts = {
  placeholder: 'Без категории',
  create: 'Новая категория',
  createTitle: 'Создание категории',
  renameTitle: 'Переименование категории',
  namePlaceholder: 'Например, Аксессуары',
  nameRequired: 'Введите название категории',
  nameLabel: 'Название категории',
  parentLabel: 'Вложить в категорию',
  parentPlaceholder: 'Верхний уровень',
  positionLabel: 'Порядок',
  positionHint: 'Меньше число — выше в списке',
  imageLabel: 'Картинка категории',
  imageHint: 'Показывается в плитке категорий на главной.',
  visibleLabel: 'Показывать в каталоге',
  deleteTitle: 'Удалить категорию?',
  deleteHint: 'Категорию можно удалить, только если в ней нет товаров и подкатегорий.',
  empty: 'Категорий пока нет',
  emptyHint: 'Создайте первую — она сразу подставится в товар',
} as const;
