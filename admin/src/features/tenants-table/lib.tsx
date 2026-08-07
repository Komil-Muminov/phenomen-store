import { Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, EditOutlined, StopOutlined, UserAddOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { If } from '@/shared/ui/If';
import { TenantStatuses } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

interface IHandlers {
  onEdit: (tenant: ITenant) => void;
  onAddOwner: (tenant: ITenant) => void;
  onDeactivate: (tenant: ITenant) => void;
  onActivate: (tenant: ITenant) => void;
}

const PLAN_COLORS: Record<string, string> = {
  start: 'default',
  pro: 'purple',
  enterprise: 'gold',
};

const formatDate = (value: string): string => new Date(value).toLocaleDateString('ru-RU');

export const buildTenantColumns = ({
  onEdit,
  onAddOwner,
  onDeactivate,
  onActivate,
}: IHandlers): ColumnsType<ITenant> => [
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
      <Space size={4}>
        <Tooltip title="Редактировать">
          <Button
            type="text"
            aria-label="Редактировать магазин"
            icon={<EditOutlined />}
            onClick={() => onEdit(tenant)}
            className="cursor-pointer!"
          />
        </Tooltip>

        <Tooltip title="Добавить владельца">
          <Button
            type="text"
            aria-label="Добавить владельца"
            icon={<UserAddOutlined />}
            onClick={() => onAddOwner(tenant)}
            className="cursor-pointer!"
          />
        </Tooltip>

        <If
          condition={tenant.status === TenantStatuses.active}
          fallback={(
            <Tooltip title="Включить">
              <Button
                type="text"
                aria-label="Включить магазин"
                icon={<CheckCircleOutlined />}
                onClick={() => onActivate(tenant)}
                className="cursor-pointer!"
              />
            </Tooltip>
          )}
        >
          <Tooltip title="Отключить">
            <Button
              type="text"
              danger
              aria-label="Отключить магазин"
              icon={<StopOutlined />}
              onClick={() => onDeactivate(tenant)}
              className="cursor-pointer!"
            />
          </Tooltip>
        </If>
      </Space>
    ),
  },
];
