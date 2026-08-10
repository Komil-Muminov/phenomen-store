import { InputNumber, Switch, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { If } from '@/shared/ui/If';
import {
  AttributeTexts,
  AttributeValuePicker,
  RenderAttributeAdd,
  RenderAttributeLabel,
} from '@/features/attribute-value-picker';
import type { IShopAttribute } from '@/entities/shop';
import type { IVariantRow } from '@/features/product-form/model';

interface IProps {
  options: IShopAttribute[];
  isBusy: boolean;
  enabled: boolean;
  selected: Record<string, string[]>;
  rows: IVariantRow[];
  basePrice: number;
  onToggle: (next: boolean) => void;
  onSelect: (code: string, values: string[]) => void;
  onSaveValues: (attributeId: string, values: string[]) => Promise<void>;
  onAdd: () => void;
  onRename: (attribute: IShopAttribute) => void;
  onDelete: (attribute: IShopAttribute) => void;
  onRowChange: (key: string, field: 'price' | 'stock', value: number | null) => void;
}

const buildColumns = (
  options: IShopAttribute[],
  basePrice: number,
  onRowChange: IProps['onRowChange'],
): ColumnsType<IVariantRow> => [
  ...options.map((option) => ({
    title: option.name,
    key: option.code,
    render: (_value: unknown, row: IVariantRow) => (
      <Tag color="purple">{row.options[option.code] ?? '—'}</Tag>
    ),
  })),
  {
    title: 'Остаток',
    key: 'stock',
    width: 120,
    render: (_value: unknown, row: IVariantRow) => (
      <InputNumber
        min={0}
        value={row.stock}
        onChange={(next) => onRowChange(row.key, 'stock', next)}
        className="w-full!"
      />
    ),
  },
  {
    title: 'Своя цена',
    key: 'price',
    width: 160,
    render: (_value: unknown, row: IVariantRow) => (
      <InputNumber
        min={0}
        value={row.price}
        placeholder={String(basePrice)}
        onChange={(next) => onRowChange(row.key, 'price', next)}
        className="w-full!"
      />
    ),
  },
];

export const RenderVariants = ({
  options,
  isBusy,
  enabled,
  selected,
  rows,
  basePrice,
  onToggle,
  onSelect,
  onRowChange,
  onSaveValues,
  onAdd,
  onRename,
  onDelete,
}: IProps) => (
  <section className="rounded-2xl border border-slate-200/80 p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onChange={onToggle} />
        <Typography.Text strong className="text-slate-800! font-semibold!">
          Товар бывает в разных вариантах
        </Typography.Text>
      </div>

      <If condition={enabled && options.length === 0}>
        <RenderAttributeAdd title={AttributeTexts.addOption} onClick={onAdd} />
      </If>
    </div>

      <If condition={enabled}>
        <If
          condition={options.length > 0}
          fallback={(
            <Typography.Text className="text-sm! text-slate-500!">
              Нет характеристик для вариантов — добавьте, например, «Размер» или «Цвет»
            </Typography.Text>
          )}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((option) => (
              <div key={option.code} className="block">
                <RenderAttributeLabel
                  id={option.id}
                  name={option.name}
                  onRename={() => onRename(option)}
                  onDelete={() => onDelete(option)}
                />
                <AttributeValuePicker
                  attribute={option}
                  value=""
                  picked={selected[option.code] ?? []}
                  multiple
                  isBusy={isBusy}
                  attributeLabel={AttributeTexts.addOption}
                  onChange={() => undefined}
                  onPick={(next) => onSelect(option.code, next)}
                  onCreateAttribute={onAdd}
                  onSaveValues={onSaveValues}
                />
              </div>
            ))}
          </div>
        </If>

        <If condition={rows.length > 0}>
          <div className="mt-4">
            <Typography.Text type="secondary" className="mb-2! block text-sm!">
              Комбинаций: {rows.length}. Пустая цена — берётся цена товара.
            </Typography.Text>
            <Table<IVariantRow>
              rowKey="key"
              size="small"
              pagination={false}
              scroll={{ x: 'max-content', y: 260 }}
              columns={buildColumns(options, basePrice, onRowChange)}
              dataSource={rows}
            />
          </div>
        </If>
      </If>
  </section>
);
