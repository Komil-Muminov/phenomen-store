import { Select, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { OrderStatusLabels, OrderStatuses } from '@/shared/config';
import type { IOrder } from '@/entities/shop';

interface IHandlers {
  onStatusChange: (order: IOrder, status: string) => void;
  savingId: string;
}

const STATUS_COLORS: Record<string, string> = {
  created: 'default',
  confirmed: 'blue',
  assembling: 'geekblue',
  delivering: 'orange',
  completed: 'green',
  cancelled: 'red',
};

const formatMoney = (value: number, currency: string): string => `${value.toLocaleString('ru-RU')} ${currency}`;

const formatDateTime = (value: string): string => new Date(value).toLocaleString('ru-RU');

const readCustomerName = (customer: Record<string, unknown> | null): string => {
  const name = customer?.name;

  return typeof name === 'string' && name ? name : '—';
};

export const buildOrderColumns = ({ onStatusChange, savingId }: IHandlers): ColumnsType<IOrder> => [
  {
    title: 'Номер',
    dataIndex: 'number',
    key: 'number',
    render: (value: string) => <span className="font-mono text-sm text-violet-700">{value}</span>,
  },
  {
    title: 'Покупатель',
    dataIndex: 'customer',
    key: 'customer',
    render: (value: Record<string, unknown> | null) => readCustomerName(value),
  },
  {
    title: 'Позиций',
    dataIndex: 'items',
    key: 'items',
    render: (items: IOrder['items']) => items.length,
  },
  {
    title: 'Сумма',
    key: 'grandTotal',
    render: (_value: unknown, order: IOrder) => (
      <span className="font-medium">{formatMoney(order.grandTotal, order.currency)}</span>
    ),
  },
  {
    title: 'Создан',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (value: string) => (
      <span className="text-sm text-slate-500">{formatDateTime(value)}</span>
    ),
  },
  {
    title: 'Статус',
    key: 'status',
    render: (_value: unknown, order: IOrder) => (
      <Select
        value={order.status}
        loading={savingId === order.id}
        disabled={savingId === order.id}
        onChange={(next) => onStatusChange(order, next)}
        className="min-w-36"
        options={OrderStatuses.map((status) => ({
          value: status,
          label: (
            <Tag color={STATUS_COLORS[status] ?? 'default'} className="mr-0!">
              {OrderStatusLabels[status] ?? status}
            </Tag>
          ),
        }))}
      />
    ),
  },
  {
    title: 'Комментарий',
    dataIndex: 'comment',
    key: 'comment',
    render: (value: string | null) => (
      <Typography.Text type="secondary" ellipsis className="max-w-48!">
        {value || '—'}
      </Typography.Text>
    ),
  },
];
