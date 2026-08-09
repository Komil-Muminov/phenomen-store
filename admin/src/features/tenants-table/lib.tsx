import { Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SettingOutlined } from '@ant-design/icons';
import { TenantStatuses } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

interface IHandlers {
  onOpen: (tenant: ITenant) => void;
}

const PLAN_COLORS: Record<string, string> = {
  start: 'default',
  pro: 'purple',
  enterprise: 'gold',
};

const formatDate = (value: string): string => new Date(value).toLocaleDateString('ru-RU');

export const buildTenantColumns = ({ onOpen }: IHandlers): ColumnsType<ITenant> => [
  {
    title: 'Ключ',
    dataIndex: 'key',
    key: 'key',
    render: (value: string) => <span className="font-mono text-sm text-violet-700">{value}</span>,
  },
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Вертикаль',
    dataIndex: 'vertical',
    key: 'vertical',
  },
  {
    title: 'План',
    dataIndex: 'plan',
    key: 'plan',
    render: (value: string) => <Tag color={PLAN_COLORS[value] ?? 'default'}>{value}</Tag>,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (value: string) => (
      <Tag color={value === TenantStatuses.active ? 'green' : 'red'}>
        {value === TenantStatuses.active ? 'активен' : 'отключён'}
      </Tag>
    ),
  },
  {
    title: 'Создан',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (value: string) => <span className="text-sm text-slate-500">{formatDate(value)}</span>,
  },
  {
    title: 'Действия',
    key: 'actions',
    align: 'right',
    render: (_value: unknown, tenant: ITenant) => (
      <Button
        icon={<SettingOutlined />}
        onClick={() => onOpen(tenant)}
        className="cursor-pointer! transition-colors! duration-200!"
      >
        Управление
      </Button>
    ),
  },
];
