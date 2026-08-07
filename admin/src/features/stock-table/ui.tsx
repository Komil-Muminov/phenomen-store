import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildStockColumns } from '@/features/stock-table/lib';
import type { IStockItem } from '@/entities/shop';

interface IProps {
  items: IStockItem[];
  isLoading: boolean;
  savingId: string;
  onChange: (item: IStockItem, stock: number) => void;
}

export const StockTable = ({ items, isLoading, savingId, onChange }: IProps) => {
  const columns = useMemo(() => buildStockColumns({ onChange, savingId }), [onChange, savingId]);

  return (
    <Table<IStockItem>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Вариантов пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
