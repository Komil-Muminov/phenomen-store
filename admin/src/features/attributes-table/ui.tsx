import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildAttributeColumns } from '@/features/attributes-table/lib';
import type { IShopAttribute } from '@/entities/shop';

interface IProps {
  items: IShopAttribute[];
  isLoading: boolean;
  onEdit: (attribute: IShopAttribute) => void;
}

export const AttributesTable = ({ items, isLoading, onEdit }: IProps) => {
  const columns = useMemo(() => buildAttributeColumns({ onEdit }), [onEdit]);

  return (
    <Table<IShopAttribute>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Характеристик пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
