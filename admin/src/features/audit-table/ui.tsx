import { useMemo } from 'react';
import { Empty, Table } from 'antd';
import { buildAuditColumns } from '@/features/audit-table/lib';
import type { IAuditEntry } from '@/entities/tenant';

interface IProps {
  items: IAuditEntry[];
  isLoading: boolean;
}

export const AuditTable = ({ items, isLoading }: IProps) => {
  const columns = useMemo(() => buildAuditColumns(), []);

  return (
    <Table<IAuditEntry>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={items}
      loading={isLoading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="Записей пока нет" /> }}
      className="overflow-x-auto"
    />
  );
};
