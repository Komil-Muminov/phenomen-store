import { Button, Select, Space, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import type { IShopCategory } from '@/entities/shop';

interface IProps {
  count: number;
  categories: IShopCategory[];
  isSaving: boolean;
  onVisibility: (isActive: boolean) => void;
  onCategory: (categoryId: string) => void;
  onReset: () => void;
}

export const RenderBulk = ({
  count,
  categories,
  isSaving,
  onVisibility,
  onCategory,
  onReset,
}: IProps) => (
  <If condition={count > 0}>
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 px-4 py-3">
      <Typography.Text strong className="text-slate-900!">
        {`Выбрано: ${count}`}
      </Typography.Text>

      <Space wrap>
        <Button
          icon={<EyeInvisibleOutlined />}
          loading={isSaving}
          onClick={() => onVisibility(false)}
          className="cursor-pointer!"
        >
          Скрыть
        </Button>

        <Button
          icon={<EyeOutlined />}
          loading={isSaving}
          onClick={() => onVisibility(true)}
          className="cursor-pointer!"
        >
          Показать
        </Button>

        <Select
          value={undefined}
          placeholder="Перенести в категорию"
          options={categories.map((item) => ({ value: item.id, label: item.name }))}
          onChange={onCategory}
          disabled={isSaving}
          className="w-56"
        />

        <Button type="text" onClick={onReset} className="cursor-pointer!">
          Снять выделение
        </Button>
      </Space>
    </div>
  </If>
);
