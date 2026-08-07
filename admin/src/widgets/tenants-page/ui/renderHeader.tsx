import { Button, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from '@/shared/ui/Tooltip';

interface IProps {
  total: number;
  isFetching: boolean;
  onCreate: () => void;
  onRefresh: () => void;
}

export const RenderHeader = ({ total, isFetching, onCreate, onRefresh }: IProps) => (
  <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <Typography.Title level={3} className="mb-0! text-brand-text!">
        Магазины
      </Typography.Title>
      <Typography.Text type="secondary">Всего магазинов: {total}</Typography.Text>
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
    </div>
  </header>
);
