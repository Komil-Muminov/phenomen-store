import { Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { IAuditEntry } from '@/entities/tenant';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'вход',
  'auth.password.update': 'смена пароля',
  'tenant.create': 'создан магазин',
  'tenant.update': 'изменён магазин',
  'tenant.deactivate': 'магазин отключён',
  'tenant.owner.create': 'добавлен владелец',
  'platform.user.create': 'добавлен админ',
};

const ACTION_COLORS: Record<string, string> = {
  'tenant.create': 'green',
  'tenant.deactivate': 'red',
  'tenant.owner.create': 'purple',
  'platform.user.create': 'gold',
  'auth.password.update': 'orange',
};

const formatDateTime = (value: string): string => new Date(value).toLocaleString('ru-RU');

export const buildAuditColumns = (): ColumnsType<IAuditEntry> => [
  {
    title: 'Когда',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (value: string) => (
      <span className="whitespace-nowrap text-sm text-slate-500">{formatDateTime(value)}</span>
    ),
  },
  {
    title: 'Кто',
    dataIndex: 'actorLogin',
    key: 'actorLogin',
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Действие',
    dataIndex: 'action',
    key: 'action',
    render: (value: string) => (
      <Tag color={ACTION_COLORS[value] ?? 'default'}>{ACTION_LABELS[value] ?? value}</Tag>
    ),
  },
  {
    title: 'Магазин',
    dataIndex: 'tenantKey',
    key: 'tenantKey',
    render: (value: string | null) => (
      value
        ? <span className="font-mono text-xs text-violet-700">{value}</span>
        : <Typography.Text type="secondary">—</Typography.Text>
    ),
  },
  {
    title: 'Подробности',
    dataIndex: 'payload',
    key: 'payload',
    render: (value: Record<string, unknown>) => {
      const entries = Object.entries(value ?? {});

      return entries.length === 0
        ? <Typography.Text type="secondary">—</Typography.Text>
        : (
          <span className="font-mono text-xs text-slate-500">
            {entries.map(([key, item]) => `${key}: ${String(item)}`).join(', ')}
          </span>
        );
    },
  },
];
