import { ReactNode } from 'react';
import { Button, Input } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';

interface IProps {
  title: string;
  subtitle: string;
  search: string;
  searchPlaceholder: string;
  isFetching: boolean;
  onSearch: (value: string) => void;
  onRefresh: () => void;
  filters?: ReactNode;
  actions?: ReactNode;
}

export const ListToolbar = ({
  title,
  subtitle,
  search,
  searchPlaceholder,
  isFetching,
  onSearch,
  onRefresh,
  filters = null,
  actions = null,
}: IProps) => (
  <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-3 min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-0">
        {title}
      </h1>
      <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        {subtitle}
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-2.5">
      <Input
        allowClear
        value={search}
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined className="text-slate-400" />}
        onChange={(event) => onSearch(event.target.value)}
        className="w-64!"
      />

      {filters}

      <Tooltip title="Обновить">
        <Button
          aria-label={`Обновить: ${title}`}
          icon={<ReloadOutlined />}
          loading={isFetching}
          onClick={onRefresh}
          className="cursor-pointer! border-slate-200/80 hover:text-indigo-600!"
        />
      </Tooltip>

      <If condition={Boolean(actions)}>{actions}</If>
    </div>
  </header>
);
