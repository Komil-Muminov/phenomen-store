import { useCallback, useMemo, useState } from 'react';
import { Empty, Table } from 'antd';
import { UiMessages } from '@/shared/config';
import { buildBannerColumns } from '@/features/banners-table/lib';
import type { IShopBanner, IShopCategory, IShopProduct } from '@/entities/shop';

interface IProps {
  items: IShopBanner[];
  categories: IShopCategory[];
  products: IShopProduct[];
  isLoading: boolean;
  canReorder: boolean;
  onEdit: (banner: IShopBanner) => void;
  onDeactivate: (banner: IShopBanner) => void;
  onDelete: (banner: IShopBanner) => void;
  onReorder: (ids: string[]) => void;
}

const ROW_BASE = 'transition-colors duration-200';

const ROW_OVER = 'bg-violet-50';

const buildNames = (items: { id: string; name: string }[]): Record<string, string> => (
  items.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item.id]: item.name }), {})
);

const moveItem = (items: IShopBanner[], from: number, to: number): string[] => {
  const next = [...items];
  const [moved] = next.splice(from, 1);

  next.splice(to, 0, moved);

  return next.map((item) => item.id);
};

export const BannersTable = ({
  items,
  categories,
  products,
  isLoading,
  canReorder,
  onEdit,
  onDeactivate,
  onDelete,
  onReorder,
}: IProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const categoryNames = useMemo(() => buildNames(categories), [categories]);
  const productNames = useMemo(() => buildNames(products), [products]);
  const columns = useMemo(
    () => buildBannerColumns({ onEdit, onDeactivate, onDelete, categoryNames, productNames }),
    [onEdit, onDeactivate, onDelete, categoryNames, productNames],
  );

  const resetDrag = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const handleDrop = useCallback((target: number) => {
    if (canReorder && dragIndex !== null && dragIndex !== target) {
      onReorder(moveItem(items, dragIndex, target));
    }

    resetDrag();
  }, [canReorder, dragIndex, items, onReorder, resetDrag]);

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
      onRow={(_record, index) => ({
        draggable: canReorder,
        className: overIndex === index && dragIndex !== index ? `${ROW_BASE} ${ROW_OVER}` : ROW_BASE,
        onDragStart: () => setDragIndex(index ?? null),
        onDragEnter: () => setOverIndex(index ?? null),
        onDragOver: (event) => event.preventDefault(),
        onDragEnd: resetDrag,
        onDrop: (event) => {
          event.preventDefault();
          handleDrop(index ?? 0);
        },
      })}
    />
  );
};
