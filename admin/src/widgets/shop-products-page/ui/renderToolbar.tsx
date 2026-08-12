import { Button, Select } from 'antd';
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { VisibilityOptions } from '@/shared/config';
import { formatVisibility } from '@/shared/lib';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import type { IShopCategory } from '@/entities/shop';

interface IProps {
  total: number;
  search: string;
  categoryId?: string;
  isActive?: boolean;
  categories: IShopCategory[];
  isFetching: boolean;
  onSearch: (value: string) => void;
  onCategory: (value: string | undefined) => void;
  onVisibility: (value: string) => void;
  onRefresh: () => void;
  onImport: () => void;
  onExport: () => void;
  onCreate: () => void;
}

export const RenderToolbar = ({
  total,
  search,
  categoryId,
  isActive,
  categories,
  isFetching,
  onSearch,
  onCategory,
  onVisibility,
  onRefresh,
  onImport,
  onExport,
  onCreate,
}: IProps) => (
  <ListToolbar
    title="Товары"
    subtitle={`Найдено: ${total}`}
    search={search}
    searchPlaceholder="Название, бренд или слаг"
    isFetching={isFetching}
    onSearch={onSearch}
    onRefresh={onRefresh}
    filters={(
      <>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Все категории"
          value={categoryId}
          onChange={onCategory}
          className="min-w-48"
          options={categories.map((item) => ({ value: item.id, label: item.name }))}
        />

        <Select
          value={formatVisibility(isActive)}
          onChange={onVisibility}
          className="min-w-40"
          options={VisibilityOptions}
        />
      </>
    )}
    actions={(
      <>
        <Button icon={<DownloadOutlined />} onClick={onExport} className="cursor-pointer!">
          Выгрузить
        </Button>

        <Button icon={<UploadOutlined />} onClick={onImport} className="cursor-pointer!">
          Загрузить из таблицы
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          className="cursor-pointer! transition-colors! duration-200!"
        >
          Новый товар
        </Button>
      </>
    )}
  />
);
