import { Button, Typography } from 'antd';
import { LogoutOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';

interface IProps {
  adminName: string;
  total: number;
  isFetching: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export const RenderHeader = ({
  adminName,
  total,
  isFetching,
  onCreate,
  onRefresh,
  onSignOut,
}: IProps) => (
  <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <Typography.Title level={3} className="mb-0! text-brand-text!">
        Магазины
      </Typography.Title>
      <Typography.Text type="secondary">
        Всего: {total} · вы вошли как {adminName}
      </Typography.Text>
    </div>

    <div className="flex items-center gap-2">
      <Tooltip title="Обновить список">
        <Button
          aria-label="Обновить список"
          icon={<ReloadOutlined />}
          loading={isFetching}
          onClick={onRefresh}
          className="cursor-pointer!"
        />
      </Tooltip>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onCreate}
        className="cursor-pointer! transition-colors! duration-200!"
      >
        Новый магазин
      </Button>

      <Tooltip title="Выйти">
        <Button
          aria-label="Выйти"
          icon={<LogoutOutlined />}
          onClick={onSignOut}
          className="cursor-pointer!"
        />
      </Tooltip>
    </div>
  </header>
);
