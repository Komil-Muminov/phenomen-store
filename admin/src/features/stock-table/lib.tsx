import { InputNumber, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IStockItem } from '@/entities/shop';

interface IHandlers {
  onChange: (item: IStockItem, stock: number) => void;
  savingId: string;
}

const LOW_STOCK = 3;

const readOptionValues = (options: Record<string, string>): string[] => (
  Object.keys(options).sort().map((code) => options[code])
);

export const buildStockColumns = ({ onChange, savingId }: IHandlers): ColumnsType<IStockItem> => [
  {
    title: 'Товар',
    dataIndex: 'productName',
    key: 'productName',
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Вариант',
    key: 'options',
    render: (_value: unknown, item: IStockItem) => (
      <span className="flex flex-wrap gap-1">
        {readOptionValues(item.options).map((value) => (
          <Tag key={value} color="purple" className="mr-0!">{value}</Tag>
        ))}
      </span>
    ),
  },
  {
    title: 'Артикул',
    dataIndex: 'sku',
    key: 'sku',
    render: (value: string) => <span className="font-mono text-xs text-slate-500">{value}</span>,
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => `${value.toLocaleString('ru-RU')} смн`,
  },
  {
    title: 'Остаток',
    key: 'stock',
    width: 140,
    render: (_value: unknown, item: IStockItem) => (
      <InputNumber
        min={0}
        value={item.stock}
        disabled={savingId === item.id}
        onChange={(next) => onChange(item, Number(next ?? 0))}
        className="w-full!"
        status={item.stock === 0 ? 'error' : undefined}
      />
    ),
  },
  {
    title: '',
    key: 'flag',
    width: 90,
    render: (_value: unknown, item: IStockItem) => {
      if (item.stock === 0) {
        return <Tag color="red">нет</Tag>;
      }

      return item.stock <= LOW_STOCK ? <Tag color="orange">мало</Tag> : null;
    },
  },
];
