import { Button, Select, Tag, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { ColumnsType } from 'antd/es/table';
import { OrderStatusLabels, OrderStatuses } from '@/shared/config';
import type { IOrder } from '@/entities/shop';

interface IHandlers {
  onStatusChange: (order: IOrder, status: string) => void;
  onOpen: (order: IOrder) => void;
  savingId: string;
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: 'default',
  review: 'gold',
  paid: 'green',
  failed: 'red',
  refunded: 'purple',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'ожидает',
  review: 'чек на проверке',
  paid: 'оплачен',
  failed: 'не принята',
  refunded: 'возврат',
};

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
  const parts = [customer?.name, customer?.lastName]
    .filter((part): part is string => typeof part === 'string' && part.length > 0);

  return parts.length > 0 ? parts.join(' ') : '—';
};

export const buildOrderColumns = ({ onStatusChange, onOpen, savingId }: IHandlers): ColumnsType<IOrder> => [
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
      <span className="font-medium">{formatMoney(order.totals.grandTotal, order.totals.currency)}</span>
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
    title: 'Оплата',
    key: 'paymentStatus',
    render: (_value: unknown, order: IOrder) => (
      <Tag color={PAYMENT_COLORS[order.paymentStatus] ?? 'default'}>
        {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
      </Tag>
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
  {
    title: '',
    key: 'actions',
    render: (_value: unknown, order: IOrder) => (
      <Tooltip title="Оплата и доставка">
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onOpen(order)}
          className="cursor-pointer!"
        />
      </Tooltip>
    ),
  },
];
