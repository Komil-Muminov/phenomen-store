import { Form, Input, Select } from 'antd';
import { BannerActionOptions, BannerActionTypes, UiMessages } from '@/shared/config';
import { If } from '@/shared/ui/If';
import type { IShopCategory, IShopProduct } from '@/entities/shop';

interface IProps {
  actionType: string;
  categories: IShopCategory[];
  products: IShopProduct[];
}

export const RenderAction = ({ actionType, categories, products }: IProps) => (
  <section className="mb-4 rounded-xl border border-violet-200 p-4">
    <Form.Item
      name="actionType"
      label="Куда ведёт баннер"
      extra="Без перехода баннер откроет каталог со скидками"
      className="mb-3!"
    >
      <Select options={BannerActionOptions.map((option) => ({ ...option }))} />
    </Form.Item>

    <If condition={actionType === BannerActionTypes.category}>
      <Form.Item
        name="actionValue"
        label="Категория"
        rules={[{ required: true, message: UiMessages.required }]}
        className="mb-0!"
      >
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Выберите категорию"
          options={categories.map((item) => ({ value: item.id, label: item.name }))}
        />
      </Form.Item>
    </If>

    <If condition={actionType === BannerActionTypes.product}>
      <Form.Item
        name="actionValue"
        label="Товар"
        rules={[{ required: true, message: UiMessages.required }]}
        className="mb-0!"
      >
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Выберите товар"
          options={products.map((item) => ({ value: item.id, label: item.name }))}
        />
      </Form.Item>
    </If>

    <If condition={actionType === BannerActionTypes.link}>
      <Form.Item
        name="actionValue"
        label="Ссылка перехода"
        extra="Откроется в браузере телефона"
        rules={[{ required: true, message: UiMessages.required }]}
        className="mb-0!"
      >
        <Input placeholder="https://" />
      </Form.Item>
    </If>
  </section>
);
