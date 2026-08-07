import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildProductColumns } from '@/features/products-table/lib';
import type { IShopProduct } from '@/entities/shop';

interface IProps {
  items: IShopProduct[];
  isLoading: boolean;
  onEdit: (product: IShopProduct) => void;
  onToggle: (product: IShopProduct) => void;
  onDuplicate: (product: IShopProduct) => void;
}

export const ProductsTable = ({ items, isLoading, onEdit, onToggle, onDuplicate }: IProps) => {
  const columns = useMemo(
    () => buildProductColumns({ onEdit, onToggle, onDuplicate }),
    [onEdit, onToggle, onDuplicate],
  );

  return (
    <Table<IShopProduct>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Товаров пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
