import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildOrderColumns } from '@/features/orders-table/lib';
import type { IOrder } from '@/entities/shop';

interface IProps {
  items: IOrder[];
  isLoading: boolean;
  savingId: string;
  onStatusChange: (order: IOrder, status: string) => void;
  onOpen: (order: IOrder) => void;
}

export const OrdersTable = ({ items, isLoading, savingId, onStatusChange, onOpen }: IProps) => {
  const columns = useMemo(
    () => buildOrderColumns({ onStatusChange, onOpen, savingId }),
    [onStatusChange, onOpen, savingId],
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
