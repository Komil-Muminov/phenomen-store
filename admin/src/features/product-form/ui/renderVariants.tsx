import { InputNumber, Select, Switch, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { If } from '@/shared/ui/If';
import type { IShopAttribute } from '@/entities/shop';
import type { IVariantRow } from '@/features/product-form/model';

interface IProps {
  options: IShopAttribute[];
  enabled: boolean;
  selected: Record<string, string[]>;
  rows: IVariantRow[];
  basePrice: number;
  onToggle: (next: boolean) => void;
  onSelect: (code: string, values: string[]) => void;
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
  enabled,
  selected,
  rows,
  basePrice,
  onToggle,
  onSelect,
  onRowChange,
}: IProps) => (
  <If condition={options.length > 0}>
    <section className="rounded-xl border border-violet-200 p-4">
      <div className="mb-3 flex items-center gap-3">
        <Switch checked={enabled} onChange={onToggle} />
        <Typography.Text strong className="text-brand-text!">
          Товар бывает в разных вариантах
        </Typography.Text>
      </div>

      <If condition={enabled}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <label key={option.code} className="block">
              <span className="mb-1 block text-sm text-slate-600">{option.name}</span>
              <Select
                mode="tags"
                value={selected[option.code] ?? []}
                onChange={(next) => onSelect(option.code, next)}
                options={option.values.map((item) => ({ value: item, label: item }))}
                placeholder="Выберите или впишите своё"
                className="w-full"
              />
            </label>
          ))}
        </div>

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
  </If>
);
