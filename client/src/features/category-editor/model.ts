export interface IEditorCategory {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  imageUrl?: string | null;
  position?: number;
  isActive?: boolean;
}

export interface ICategoryDraft {
  id: string | null;
  name: string;
  parentId: string | null;
  imageUrl: string;
  position: string;
  isActive: boolean;
}

export interface ICategoryPayload {
  name: string;
  parentId: string | null;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
}

export interface ICategoryHandlers {
  onCreateCategory: (payload: ICategoryPayload) => void;
  onUpdateCategory: (id: string, payload: ICategoryPayload) => void;
  onDeleteCategory: (id: string) => void;
}

export const DEFAULT_POSITION = 100;

export const EMPTY_DRAFT: ICategoryDraft = {
  id: null,
  name: '',
  parentId: null,
  imageUrl: '',
  position: String(DEFAULT_POSITION),
  isActive: true,
};

export const CategoryTexts = {
  label: 'Категория',
  none: 'Без категории',
  create: 'Новая',
  createTitle: 'Новая категория',
  editTitle: 'Категория',
  nameLabel: 'Название',
  namePlaceholder: 'Например, Аксессуары',
  parentLabel: 'Вложить в категорию',
  parentNone: 'Верхний уровень',
  imageLabel: 'Картинка категории',
  positionLabel: 'Порядок',
  positionHint: 'Меньше число — выше в списке',
  visibleLabel: 'Показывать в каталоге',
  save: 'Сохранить',
  cancel: 'Отмена',
  deleteTitle: 'Удалить категорию?',
  deleteHint: 'Удалить можно только категорию без товаров и подкатегорий',
  hidden: 'скрыта',
} as const;

export const toCategoryDraft = (category: IEditorCategory): ICategoryDraft => ({
  id: category.id,
  name: category.name,
  parentId: category.parentId ?? null,
  imageUrl: category.imageUrl ?? '',
  position: String(category.position ?? DEFAULT_POSITION),
  isActive: category.isActive !== false,
});

export const toCategoryPayload = (draft: ICategoryDraft): ICategoryPayload => ({
  name: draft.name.trim(),
  parentId: draft.parentId,
  imageUrl: draft.imageUrl.trim() || null,
  position: Number(draft.position) || DEFAULT_POSITION,
  isActive: draft.isActive,
});
