import { Button, Input, Select } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';
import { AuditActionLabels } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

interface IProps {
  search: string;
  action: string | undefined;
  tenantKey: string | undefined;
  actions: string[];
  tenants: ITenant[];
  isFetching: boolean;
  onSearch: (value: string) => void;
  onAction: (value: string | undefined) => void;
  onTenant: (value: string | undefined) => void;
  onRefresh: () => void;
}

export const RenderFilters = ({
  search,
  action,
  tenantKey,
  actions,
  tenants,
  isFetching,
  onSearch,
  onAction,
  onTenant,
  onRefresh,
}: IProps) => (
  <section className="mb-4 flex flex-wrap items-center gap-2">
    <Input
      allowClear
      value={search}
      onChange={(event) => onSearch(event.target.value)}
      placeholder="Поиск по логину, магазину, подробностям"
      prefix={<SearchOutlined className="text-violet-400" aria-hidden="true" />}
      className="max-w-80!"
    />

    <Select
      allowClear
      value={action}
      onChange={onAction}
      placeholder="Все действия"
      className="min-w-52"
      options={actions.map((item) => ({
        value: item,
        label: AuditActionLabels[item] ?? item,
      }))}
    />

    <Select
      allowClear
      showSearch
      value={tenantKey}
      onChange={onTenant}
      placeholder="Все магазины"
      className="min-w-48"
      optionFilterProp="label"
      options={tenants.map((item) => ({ value: item.key, label: item.key }))}
    />

    <Tooltip title="Обновить">
      <Button
        aria-label="Обновить журнал"
        icon={<ReloadOutlined />}
        loading={isFetching}
        onClick={onRefresh}
        className="cursor-pointer!"
      />
    </Tooltip>
  </section>
);
