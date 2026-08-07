import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, StopOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { If } from '@/shared/ui/If';
import type { IShopCategory } from '@/entities/shop';

interface IHandlers {
  onEdit: (category: IShopCategory) => void;
  onDeactivate: (category: IShopCategory) => void;
  names: Record<string, string>;
}

export const buildCategoryColumns = ({
  onEdit,
  onDeactivate,
  names,
}: IHandlers): ColumnsType<IShopCategory> => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Вложена в',
    dataIndex: 'parentId',
    key: 'parentId',
    render: (value: string | null) => (
      value ? names[value] ?? '—' : <Typography.Text type="secondary">верхний уровень</Typography.Text>
    ),
  },
  {
    title: 'Порядок',
    dataIndex: 'position',
    key: 'position',
    render: (value: number) => <span className="text-sm text-slate-500">{value}</span>,
  },
  {
    title: 'Статус',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (value: boolean) => (
      <Tag color={value ? 'green' : 'red'}>{value ? 'виден' : 'скрыт'}</Tag>
    ),
  },
  {
    title: 'Ключ',
    dataIndex: 'slug',
    key: 'slug',
    render: (value: string) => <span className="font-mono text-xs text-slate-400">{value}</span>,
  },
  {
    title: '',
    key: 'actions',
    align: 'right',
    render: (_value: unknown, category: IShopCategory) => (
      <Space size={4}>
        <Tooltip title="Изменить">
          <Button
            type="text"
            aria-label="Изменить категорию"
            icon={<EditOutlined />}
            onClick={() => onEdit(category)}
            className="cursor-pointer!"
          />
        </Tooltip>

        <If condition={category.isActive !== false}>
          <Tooltip title="Скрыть">
            <Button
              type="text"
              danger
              aria-label="Скрыть категорию"
              icon={<StopOutlined />}
              onClick={() => onDeactivate(category)}
              className="cursor-pointer!"
            />
          </Tooltip>
        </If>
      </Space>
    ),
  },
];
