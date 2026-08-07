import { Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { IShopProduct } from '@/entities/shop';

interface IHandlers {
  onEdit: (product: IShopProduct) => void;
  onToggle: (product: IShopProduct) => void;
}

const formatPrice = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`;

export const buildProductColumns = ({ onEdit, onToggle }: IHandlers): ColumnsType<IShopProduct> => [
  {
    title: 'Ключ',
    dataIndex: 'slug',
    key: 'slug',
    render: (value: string) => <span className="font-mono text-sm text-violet-700">{value}</span>,
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Бренд',
    dataIndex: 'brand',
    key: 'brand',
    render: (value: string | null) => value || '—',
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => <span className="font-medium">{formatPrice(value)}</span>,
  },
  {
    title: 'Старая цена',
    dataIndex: 'oldPrice',
    key: 'oldPrice',
    render: (value: number | null) => (
      value === null ? '—' : <span className="text-slate-400 line-through">{formatPrice(value)}</span>
    ),
  },
  {
    title: 'В каталоге',
    dataIndex: 'inStock',
    key: 'inStock',
    render: (value: boolean) => (
      <Tag color={value ? 'green' : 'red'}>{value ? 'виден' : 'скрыт'}</Tag>
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
            icon={<EditOutlined />}
            onClick={() => onEdit(product)}
            className="cursor-pointer!"
          />
        </Tooltip>

        <Tooltip title={product.inStock ? 'Скрыть из каталога' : 'Вернуть в каталог'}>
          <Button
            type="text"
            danger={product.inStock}
            aria-label={product.inStock ? 'Скрыть товар' : 'Вернуть товар'}
            icon={product.inStock ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => onToggle(product)}
            className="cursor-pointer!"
          />
        </Tooltip>
      </Space>
    ),
  },
];
