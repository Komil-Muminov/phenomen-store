export type { IImportResult, IImportRow } from '@contracts/csv';

export { buildTemplate, parseCsv } from '@contracts/csv';

export const ImportTexts = {
  title: 'Загрузка товаров',
  hint: 'Вставьте таблицу в формате CSV: первая строка — заголовки, дальше по строке на товар',
  placeholder: 'название;цена;категория\nФутболка;199;Женщинам',
  template: 'Шаблон',
  templateCopied: 'Шаблон подставлен в поле',
  parsed: 'Распознано товаров',
  unknownColumns: 'Неизвестные колонки',
  submit: 'Загрузить',
  cancel: 'Закрыть',
  created: 'создано',
  updated: 'обновлено',
  failed: 'с ошибкой',
  empty: 'Ни одной строки не распознано',
} as const;
