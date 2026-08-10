import { ReactNode } from 'react';
import { Button, Input, Typography } from 'antd';
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
  <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <Typography.Title level={3} className="mb-0! text-brand-text!">
        {title}
      </Typography.Title>
      <Typography.Text type="secondary">{subtitle}</Typography.Text>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Input
        allowClear
        value={search}
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined className="text-violet-400" />}
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
          className="cursor-pointer!"
        />
      </Tooltip>

      <If condition={Boolean(actions)}>{actions}</If>
    </div>
  </header>
);
