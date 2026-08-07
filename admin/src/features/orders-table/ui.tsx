import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildOrderColumns } from '@/features/orders-table/lib';
import type { IOrder } from '@/entities/shop';

interface IProps {
  items: IOrder[];
  isLoading: boolean;
  savingId: string;
  onStatusChange: (order: IOrder, status: string) => void;
}

export const OrdersTable = ({ items, isLoading, savingId, onStatusChange }: IProps) => {
  const columns = useMemo(
    () => buildOrderColumns({ onStatusChange, savingId }),
    [onStatusChange, savingId],
  );

  return (
    <Table<IOrder>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Заказов пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
