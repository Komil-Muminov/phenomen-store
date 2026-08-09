import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildTenantColumns } from '@/features/tenants-table/lib';
import { UiMessages } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

interface IProps {
  items: ITenant[];
  isLoading: boolean;
  onOpen: (tenant: ITenant) => void;
}

export const TenantsTable = ({ items, isLoading, onOpen }: IProps) => {
  const columns = useMemo(() => buildTenantColumns({ onOpen }), [onOpen]);

  return (
    <Table<ITenant>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description={UiMessages.emptyTenants} /> }}
      className="overflow-x-auto"
    />
  );
};
