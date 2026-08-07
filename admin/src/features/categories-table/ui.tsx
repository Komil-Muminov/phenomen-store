import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildCategoryColumns } from '@/features/categories-table/lib';
import type { IShopCategory } from '@/entities/shop';

interface IProps {
  items: IShopCategory[];
  isLoading: boolean;
  onEdit: (category: IShopCategory) => void;
  onDeactivate: (category: IShopCategory) => void;
}

export const CategoriesTable = ({ items, isLoading, onEdit, onDeactivate }: IProps) => {
  const names = useMemo(
    () => items.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item.id]: item.name }), {}),
    [items],
  );
  const columns = useMemo(
    () => buildCategoryColumns({ onEdit, onDeactivate, names }),
    [onEdit, onDeactivate, names],
  );

  return (
    <Table<IShopCategory>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Категорий пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
