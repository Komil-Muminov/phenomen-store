import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildProductColumns } from '@/features/products-table/lib';
import type { IShopProduct } from '@/entities/shop';

interface IProps {
  items: IShopProduct[];
  isLoading: boolean;
  selected: string[];
  onEdit: (product: IShopProduct) => void;
  onToggle: (product: IShopProduct) => void;
  onDuplicate: (product: IShopProduct) => void;
  onSelect: (ids: string[]) => void;
}

export const ProductsTable = ({
  items,
  isLoading,
  selected,
  onEdit,
  onToggle,
  onDuplicate,
  onSelect,
}: IProps) => {
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
      rowSelection={{
        selectedRowKeys: selected,
        onChange: (keys) => onSelect(keys.map(String)),
      }}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Товаров пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
