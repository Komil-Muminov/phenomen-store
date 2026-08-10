import { Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CopyOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { IShopProduct } from '@/entities/shop';

interface IHandlers {
  onEdit: (product: IShopProduct) => void;
  onToggle: (product: IShopProduct) => void;
  onDuplicate: (product: IShopProduct) => void;
}

const formatPrice = (value: number): string => `${value.toLocaleString('ru-RU')} смн`;

export const buildProductColumns = ({
  onEdit,
  onToggle,
  onDuplicate,
}: IHandlers): ColumnsType<IShopProduct> => [
  {
    title: 'Ключ',
    dataIndex: 'slug',
    key: 'slug',
    render: (value: string) => (
      <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block">
        {value}
      </span>
    ),
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => <span className="font-semibold text-slate-900">{value}</span>,
  },
  {
    title: 'Бренд',
    dataIndex: 'brand',
    key: 'brand',
    render: (value: string | null) => (
      <span className="text-slate-600 font-medium">{value || '—'}</span>
    ),
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => <span className="font-semibold text-slate-900">{formatPrice(value)}</span>,
  },
  {
    title: 'Старая цена',
    dataIndex: 'oldPrice',
    key: 'oldPrice',
    render: (value: number | null) => (
      value === null ? <span className="text-slate-400">—</span> : <span className="text-slate-400 text-xs line-through">{formatPrice(value)}</span>
    ),
  },
  {
    title: 'В каталоге',
    dataIndex: 'inStock',
    key: 'inStock',
    render: (value: boolean) => (
      value ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          виден
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          скрыт
        </span>
      )
    ),
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'right',
    render: (_value: unknown, product: IShopProduct) => (
      <Space size={4}>
        <Tooltip title="Редактировать">
          <Button
            type="text"
            aria-label="Редактировать товар"
            icon={<EditOutlined className="text-slate-500 hover:text-indigo-600" />}
            onClick={() => onEdit(product)}
            className="cursor-pointer! hover:bg-slate-100! rounded-lg!"
          />
        </Tooltip>

        <Tooltip title="Дублировать">
          <Button
            type="text"
            aria-label="Дублировать товар"
            icon={<CopyOutlined className="text-slate-500 hover:text-indigo-600" />}
            onClick={() => onDuplicate(product)}
            className="cursor-pointer! hover:bg-slate-100! rounded-lg!"
          />
        </Tooltip>

        <Tooltip title={product.inStock ? 'Скрыть из каталога' : 'Вернуть в каталог'}>
          <Button
            type="text"
            aria-label={product.inStock ? 'Скрыть товар' : 'Вернуть товар'}
            icon={product.inStock ? <StopOutlined className="text-slate-400 hover:text-red-600" /> : <CheckCircleOutlined className="text-emerald-600 hover:text-emerald-700" />}
            onClick={() => onToggle(product)}
            className="cursor-pointer! hover:bg-slate-100! rounded-lg!"
          />
        </Tooltip>
      </Space>
    ),
  },
];
