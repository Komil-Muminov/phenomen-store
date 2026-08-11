import { useCallback, useMemo, useState } from 'react';
import { Empty, Table } from 'antd';
import { UiMessages } from '@/shared/config';
import { buildBannerColumns } from '@/features/banners-table/lib';
import { RenderCards } from '@/features/banners-table/ui/renderCards';
import type { IBannerMove } from '@/features/banners-table/model';
import type { IShopBanner, IShopCategory, IShopProduct } from '@/entities/shop';

interface IProps {
  items: IShopBanner[];
  categories: IShopCategory[];
  products: IShopProduct[];
  isLoading: boolean;
  onEdit: (banner: IShopBanner) => void;
  onDeactivate: (banner: IShopBanner) => void;
  onDelete: (banner: IShopBanner) => void;
  onReorder: (move: IBannerMove) => void;
}

const ROW_BASE = 'transition-colors duration-200';

const ROW_OVER = 'bg-violet-50';

const buildNames = (items: { id: string; name: string }[]): Record<string, string> => (
  items.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item.id]: item.name }), {})
);

const buildMove = (items: IShopBanner[], from: number, to: number): IBannerMove => (
  to > from
    ? { id: items[from].id, afterId: items[to].id }
    : { id: items[from].id, beforeId: items[to].id }
);

export const BannersTable = ({
  items,
  categories,
  products,
  isLoading,
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
    if (dragIndex !== null && dragIndex !== target) {
      onReorder(buildMove(items, dragIndex, target));
    }

    resetDrag();
  }, [dragIndex, items, onReorder, resetDrag]);

  return (
    <>
      <div className="lg:hidden">
        <RenderCards
          items={items}
          isLoading={isLoading}
          categoryNames={categoryNames}
          productNames={productNames}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
        />
      </div>

      <Table<IShopBanner>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={items}
        loading={isLoading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description={UiMessages.emptyBanners} /> }}
        className="hidden overflow-x-auto lg:block"
        onRow={(_record, index) => ({
          draggable: true,
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
    </>
  );
};
