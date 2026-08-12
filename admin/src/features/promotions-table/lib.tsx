import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import {
  IPromotion,
  PromotionKindLabels,
  PromotionTexts,
  formatDiscount,
  formatUsage,
} from '@/features/promotions-table/model';

interface IHandlers {
  onEdit: (promotion: IPromotion) => void;
  onDelete: (promotion: IPromotion) => void;
}

const formatDate = (value: string | null): string => (
  value ? new Date(value).toLocaleDateString('ru-RU') : ''
);

export const formatPeriod = (promotion: IPromotion): string => {
  const from = formatDate(promotion.startsAt);
  const to = formatDate(promotion.endsAt);

  return from || to ? `${from || '…'} — ${to || '…'}` : PromotionTexts.always;
};

export const buildPromotionColumns = ({ onEdit, onDelete }: IHandlers): ColumnsType<IPromotion> => [
  {
    title: 'Название',
    dataIndex: 'name',
    key: 'name',
    render: (value: string, promotion: IPromotion) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong className="text-slate-900!">{value}</Typography.Text>
        <Typography.Text className="text-xs! text-slate-400!">
          {promotion.code ?? PromotionTexts.noCode}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: 'Скидка',
    key: 'discount',
    render: (_value: unknown, promotion: IPromotion) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong className="text-indigo-600!">
          {formatDiscount(promotion)}
        </Typography.Text>
        <Typography.Text className="text-xs! text-slate-400!">
          {PromotionKindLabels[promotion.kind] ?? promotion.kind}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: 'От суммы',
    dataIndex: 'minTotal',
    key: 'minTotal',
    render: (value: number) => (
      <Typography.Text className="text-sm! text-slate-600!">
        {value > 0 ? `${new Intl.NumberFormat('ru-RU').format(value)} смн` : '—'}
      </Typography.Text>
    ),
  },
  {
    title: 'Период',
    key: 'period',
    render: (_value: unknown, promotion: IPromotion) => (
      <Typography.Text className="text-sm! text-slate-600!">
        {formatPeriod(promotion)}
      </Typography.Text>
    ),
  },
  {
    title: 'Использований',
    key: 'usage',
    render: (_value: unknown, promotion: IPromotion) => (
      <Typography.Text className="text-sm! text-slate-600!">
        {formatUsage(promotion)}
      </Typography.Text>
    ),
  },
  {
    title: 'Статус',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (value: boolean) => (
      <Tag color={value ? 'green' : 'default'}>{value ? 'работает' : 'выключена'}</Tag>
    ),
  },
  {
    title: '',
    key: 'actions',
    align: 'right',
    render: (_value: unknown, promotion: IPromotion) => (
      <Space size={0}>
        <Tooltip title="Изменить">
          <Button
            type="text"
            aria-label="Изменить акцию"
            icon={<EditOutlined />}
            onClick={() => onEdit(promotion)}
            className="cursor-pointer!"
          />
        </Tooltip>

        <Tooltip title="Удалить">
          <Button
            type="text"
            danger
            aria-label="Удалить акцию"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(promotion)}
            className="cursor-pointer!"
          />
        </Tooltip>
      </Space>
    ),
  },
];
