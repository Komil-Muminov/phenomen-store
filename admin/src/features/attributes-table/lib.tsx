import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { IShopAttribute } from '@/entities/shop';

interface IHandlers {
  onEdit: (attribute: IShopAttribute) => void;
}

const VISIBLE_VALUES = 8;

export const buildAttributeColumns = ({ onEdit }: IHandlers): ColumnsType<IShopAttribute> => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    title: 'Назначение',
    dataIndex: 'isVariantOption',
    key: 'isVariantOption',
    render: (value: boolean) => (
      <Tag color={value ? 'purple' : 'default'}>
        {value ? 'варианты товара' : 'характеристика'}
      </Tag>
    ),
  },
  {
    title: 'Значения',
    dataIndex: 'values',
    key: 'values',
    render: (values: string[]) => (
      <span className="flex flex-wrap gap-1">
        {values.slice(0, VISIBLE_VALUES).map((value) => (
          <Tag key={value} className="mr-0!">{value}</Tag>
        ))}
        {values.length > VISIBLE_VALUES ? (
          <Typography.Text type="secondary" className="text-xs!">
            ещё {values.length - VISIBLE_VALUES}
          </Typography.Text>
        ) : null}
        {values.length === 0 ? (
          <Typography.Text type="secondary" className="text-xs!">
            пусто, заполнится при вводе
          </Typography.Text>
        ) : null}
      </span>
    ),
  },
  {
    title: 'Код',
    dataIndex: 'code',
    key: 'code',
    render: (value: string) => <span className="font-mono text-xs text-slate-400">{value}</span>,
  },
  {
    title: '',
    key: 'actions',
    align: 'right',
    width: 60,
    render: (_value: unknown, attribute: IShopAttribute) => (
      <Space size={4}>
        <Tooltip title="Изменить">
          <Button
            type="text"
            aria-label="Изменить характеристику"
            icon={<EditOutlined />}
            onClick={() => onEdit(attribute)}
            className="cursor-pointer!"
          />
        </Tooltip>
      </Space>
    ),
  },
];
