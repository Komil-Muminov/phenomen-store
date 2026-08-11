export interface IValueDraft {
  original: string | null;
  name: string;
}

export const EMPTY_VALUE_DRAFT: IValueDraft = { original: null, name: '' };

export const ValueTexts = {
  placeholder: 'Выберите или впишите своё',
  create: 'Новое значение',
  createTitle: 'Новое значение',
  renameTitle: 'Переименование значения',
  nameLabel: 'Значение',
  namePlaceholder: 'Например, Лето',
  deleteTitle: 'Удалить значение?',
  deleteHint: 'Значение исчезнет из подсказок. В уже сохранённых товарах оно останется.',
  empty: 'Значений пока нет',
  emptyHint: 'Добавьте первое или впишите своё прямо в поле',
} as const;

export const replaceValue = (values: string[], original: string, next: string): string[] => (
  values.map((item) => (item === original ? next : item))
);

export const removeValue = (values: string[], target: string): string[] => (
  values.filter((item) => item !== target)
);

export const appendValue = (values: string[], next: string): string[] => (
  values.includes(next) ? values : [...values, next]
);

export interface IAttributeDraft {
  id: string | null;
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
}

export interface IAttributePayload {
  name: string;
  isVariantOption: boolean;
  isFilterable: boolean;
  position: number;
}

export interface IAttributeHandlers {
  onCreateAttribute: (payload: IAttributePayload) => Promise<void>;
  onUpdateAttribute: (id: string, payload: IAttributePayload) => Promise<void>;
  onDeleteAttribute: (id: string) => Promise<void>;
  onSaveValues: (attributeId: string, values: string[]) => Promise<void>;
}

export const DEFAULT_ATTRIBUTE_POSITION = 100;

export const toAttributePayload = (draft: IAttributeDraft): IAttributePayload => ({
  name: draft.name.trim(),
  isVariantOption: draft.isVariantOption,
  isFilterable: draft.isFilterable,
  position: draft.position,
});

export const AttributeTexts = {
  createTitle: 'Новая характеристика',
  renameTitle: 'Переименование характеристики',
  nameLabel: 'Название характеристики',
  detailPlaceholder: 'Например, Материал',
  optionPlaceholder: 'Например, Размер',
  detailHint: 'Описательная характеристика — просто показывается в карточке товара.',
  optionHint: 'Характеристика для вариантов — по ней собираются комбинации товара.',
  addDetail: 'Характеристика',
  addOption: 'Вариант',
  kindLabel: 'Как использовать',
  kindOption: 'Для вариантов товара',
  kindDetail: 'Просто описание',
  filterableLabel: 'Участвует в фильтрах каталога',
  positionLabel: 'Порядок',
  positionHint: 'Меньше число — выше в карточке',
  deleteTitle: 'Удалить характеристику?',
  deleteHint: 'Она пропадёт из карточек всех товаров. Если где-то заполнена, удаление будет отклонено.',
} as const;
