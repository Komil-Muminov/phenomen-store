import { Button, Empty, Image, Skeleton, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PictureOutlined, StopOutlined } from '@ant-design/icons';
import { UiMessages } from '@/shared/config';
import { resolveMediaUrl } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { formatPeriod, formatTarget } from '@/features/banners-table/lib';
import type { IShopBanner } from '@/entities/shop';

interface IProps {
  items: IShopBanner[];
  isLoading: boolean;
  categoryNames: Record<string, string>;
  productNames: Record<string, string>;
  onEdit: (banner: IShopBanner) => void;
  onDeactivate: (banner: IShopBanner) => void;
  onDelete: (banner: IShopBanner) => void;
}

export const RenderCards = ({
  items,
  isLoading,
  categoryNames,
  productNames,
  onEdit,
  onDeactivate,
  onDelete,
}: IProps) => (
  <div className="flex flex-col gap-3 p-1">
    <If
      condition={!isLoading}
      fallback={<Skeleton active paragraph={{ rows: 6 }} className="p-3" />}
    >
      <If
        condition={items.length > 0}
        fallback={<Empty description={UiMessages.emptyBanners} className="py-6" />}
      >
        {items.map((banner) => (
          <article
            key={banner.id}
            className="rounded-xl border border-violet-200 bg-white p-3 transition-colors duration-200 hover:border-violet-400"
          >
            <div className="flex gap-3">
              <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-violet-200 bg-violet-50">
                <If
                  condition={Boolean(banner.imageUrl)}
                  fallback={<PictureOutlined className="text-violet-300" aria-hidden="true" />}
                >
                  <Image
                    src={resolveMediaUrl(banner.imageUrl)}
                    alt={banner.title ?? 'Картинка баннера'}
                    width="100%"
                    height="100%"
                    className="cursor-pointer! object-cover!"
                    rootClassName="h-full w-full"
                  />
                </If>
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-medium">{banner.title ?? 'Без заголовка'}</span>
                  <Tag color={banner.isActive ? 'green' : 'red'} className="shrink-0 m-0!">
                    {banner.isActive ? 'виден' : 'скрыт'}
                  </Tag>
                </div>

                <If condition={Boolean(banner.subtitle)}>
                  <div className="truncate text-xs text-slate-500">{banner.subtitle}</div>
                </If>

                <Typography.Text type="secondary" className="mt-1! block text-xs!">
                  {formatTarget(banner, categoryNames, productNames)}
                </Typography.Text>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-violet-100 pt-2">
              <Typography.Text type="secondary" className="text-xs!">
                {`Показ: ${formatPeriod(banner)} · порядок ${banner.position}`}
              </Typography.Text>

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
                      aria-label="Скрыть баннер"
                      icon={<StopOutlined />}
                      onClick={() => onDeactivate(banner)}
                      className="cursor-pointer!"
                    />
                  </Tooltip>
                </If>

                <Tooltip title="Удалить">
                  <Button
                    type="text"
                    danger
                    aria-label="Удалить баннер"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(banner)}
                    className="cursor-pointer!"
                  />
                </Tooltip>
              </Space>
            </div>
          </article>
        ))}
      </If>
    </If>
  </div>
);
