import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildTenantColumns } from '@/features/tenants-table/lib';
import { UiMessages } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

interface IProps {
  items: ITenant[];
  isLoading: boolean;
  onEdit: (tenant: ITenant) => void;
  onAddOwner: (tenant: ITenant) => void;
  onDeactivate: (tenant: ITenant) => void;
  onActivate: (tenant: ITenant) => void;
}

export const TenantsTable = ({
  items,
  isLoading,
  onEdit,
  onAddOwner,
  onDeactivate,
  onActivate,
}: IProps) => {
  const columns = useMemo(
    () => buildTenantColumns({ onEdit, onAddOwner, onDeactivate, onActivate }),
    [onEdit, onAddOwner, onDeactivate, onActivate],
  );

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
