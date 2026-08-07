import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, PictureOutlined, StopOutlined } from '@ant-design/icons';
import { BannerActionLabels, BannerActionTypes } from '@/shared/config';
import { Tooltip } from '@/shared/ui/Tooltip';
import { If } from '@/shared/ui/If';
import type { IShopBanner } from '@/entities/shop';

interface IHandlers {
  onEdit: (banner: IShopBanner) => void;
  onDeactivate: (banner: IShopBanner) => void;
  categoryNames: Record<string, string>;
  productNames: Record<string, string>;
}

const formatDate = (value: string | null): string => (
  value ? new Date(value).toLocaleDateString('ru-RU') : ''
);

const formatPeriod = (banner: IShopBanner): string => {
  const from = formatDate(banner.startsAt);
  const to = formatDate(banner.endsAt);

  return from || to ? `${from || '…'} — ${to || '…'}` : 'всегда';
};

const formatTarget = (
  banner: IShopBanner,
  categoryNames: Record<string, string>,
  productNames: Record<string, string>,
): string => {
  const label = BannerActionLabels[banner.actionType] ?? banner.actionType;

  if (banner.actionType === BannerActionTypes.category) {
    return `${label}: ${categoryNames[banner.actionValue ?? ''] ?? '—'}`;
  }

  if (banner.actionType === BannerActionTypes.product) {
    return `${label}: ${productNames[banner.actionValue ?? ''] ?? '—'}`;
  }

  if (banner.actionType === BannerActionTypes.link) {
    return banner.actionValue ?? label;
  }

  return label;
};

export const buildBannerColumns = ({
  onEdit,
  onDeactivate,
  categoryNames,
  productNames,
}: IHandlers): ColumnsType<IShopBanner> => [
  {
    title: 'Картинка',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 120,
    render: (value: string) => (
      <span className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-violet-50">
        <If
          condition={Boolean(value)}
          fallback={<PictureOutlined className="text-violet-300" aria-hidden="true" />}
        >
          <img src={value} alt="" className="h-full w-full object-cover" />
        </If>
      </span>
    ),
  },
  {
    title: 'Текст',
    key: 'title',
    render: (_value: unknown, banner: IShopBanner) => (
      <div className="min-w-40">
        <div className="font-medium">{banner.title ?? '—'}</div>
        <If condition={Boolean(banner.subtitle)}>
          <div className="text-xs text-slate-500">{banner.subtitle}</div>
        </If>
      </div>
    ),
  },
  {
    title: 'Переход',
    key: 'action',
    render: (_value: unknown, banner: IShopBanner) => (
      <span className="block max-w-56 truncate text-sm text-slate-600">
        {formatTarget(banner, categoryNames, productNames)}
      </span>
    ),
  },
  {
    title: 'Период показа',
    key: 'period',
    render: (_value: unknown, banner: IShopBanner) => (
      <Typography.Text type="secondary" className="text-sm!">
        {formatPeriod(banner)}
      </Typography.Text>
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
    title: '',
    key: 'actions',
    align: 'right',
    render: (_value: unknown, banner: IShopBanner) => (
      <Space size={4}>
        <Tooltip title="Изменить">
          <Button
            type="text"
            aria-label="Изменить баннер"
            icon={<EditOutlined />}
            onClick={() => onEdit(banner)}
            className="cursor-pointer!"
          />
        </Tooltip>

        <If condition={banner.isActive !== false}>
          <Tooltip title="Скрыть">
            <Button
              type="text"
              danger
              aria-label="Скрыть баннер"
              icon={<StopOutlined />}
              onClick={() => onDeactivate(banner)}
              className="cursor-pointer!"
            />
          </Tooltip>
        </If>
      </Space>
    ),
  },
];
