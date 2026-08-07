import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { UiMessages } from '@/shared/config';
import { buildBannerColumns } from '@/features/banners-table/lib';
import type { IShopBanner, IShopCategory, IShopProduct } from '@/entities/shop';

interface IProps {
  items: IShopBanner[];
  categories: IShopCategory[];
  products: IShopProduct[];
  isLoading: boolean;
  onEdit: (banner: IShopBanner) => void;
  onDeactivate: (banner: IShopBanner) => void;
}

const buildNames = (items: { id: string; name: string }[]): Record<string, string> => (
  items.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item.id]: item.name }), {})
);

export const BannersTable = ({
  items,
  categories,
  products,
  isLoading,
  onEdit,
  onDeactivate,
}: IProps) => {
  const categoryNames = useMemo(() => buildNames(categories), [categories]);
  const productNames = useMemo(() => buildNames(products), [products]);
  const columns = useMemo(
    () => buildBannerColumns({ onEdit, onDeactivate, categoryNames, productNames }),
    [onEdit, onDeactivate, categoryNames, productNames],
  );

  return (
    <Table<IShopBanner>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description={UiMessages.emptyBanners} /> }}
      className="overflow-x-auto"
    />
  );
};
