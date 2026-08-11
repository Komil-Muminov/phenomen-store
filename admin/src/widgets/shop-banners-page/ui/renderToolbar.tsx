import { Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { VisibilityOptions } from '@/shared/config';
import { formatVisibility } from '@/shared/lib';
import { ListToolbar } from '@/shared/ui/ListToolbar';

interface IProps {
  total: number;
  search: string;
  isActive?: boolean;
  isFetching: boolean;
  onSearch: (value: string) => void;
  onVisibility: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
}

export const RenderToolbar = ({
  total,
  search,
  isActive,
  isFetching,
  onSearch,
  onVisibility,
  onRefresh,
  onCreate,
}: IProps) => (
  <>
    <ListToolbar
      title="Баннеры"
      subtitle={`Карусель на главной приложения — найдено: ${total}`}
      search={search}
      searchPlaceholder="Заголовок или подпись"
      isFetching={isFetching}
      onSearch={onSearch}
      onRefresh={onRefresh}
      filters={(
        <Select
          value={formatVisibility(isActive)}
          onChange={onVisibility}
          className="min-w-40"
          options={VisibilityOptions}
        />
      )}
      actions={(
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          className="cursor-pointer! transition-colors! duration-200!"
        >
          Новый баннер
        </Button>
      )}
    />

  </>
);
