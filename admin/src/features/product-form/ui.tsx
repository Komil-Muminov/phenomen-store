import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { UiMessages } from '@/shared/config';
import type { IShopCategory, IShopProduct } from '@/entities/shop';

export interface IProductFormValues {
  slug: string;
  name: string;
  brand?: string;
  description?: string;
  basePrice: number;
  oldPrice?: number | null;
  categoryId?: string | null;
}

interface IProps {
  open: boolean;
  editing: IShopProduct | null;
  categories: IShopCategory[];
  isSaving: boolean;
  onSubmit: (values: IProductFormValues) => void;
  onCancel: () => void;
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const ProductForm = ({
  open,
  editing,
  categories,
  isSaving,
  onSubmit,
  onCancel,
}: IProps) => {
  const [form] = Form.useForm<IProductFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        slug: editing?.slug ?? '',
        name: editing?.name ?? '',
        brand: editing?.brand ?? '',
        description: editing?.description ?? '',
        basePrice: editing?.price ?? 0,
        oldPrice: editing?.oldPrice ?? null,
        categoryId: editing?.categoryId ?? null,
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      open={open}
      title={editing ? 'Редактирование товара' : 'Новый товар'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="slug"
          label="Ключ товара"
          rules={[
            { required: true, message: UiMessages.required },
            { pattern: SLUG_PATTERN, message: 'Только строчные латинские буквы, цифры и дефис' },
          ]}
        >
          <Input placeholder="basic-tshirt" disabled={Boolean(editing)} className="font-mono!" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Футболка базовая" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="basePrice"
            label="Цена, ₽"
            rules={[{ required: true, message: UiMessages.required }]}
          >
            <InputNumber min={0} step={100} className="w-full!" />
          </Form.Item>

          <Form.Item name="oldPrice" label="Старая цена, ₽">
            <InputNumber min={0} step={100} className="w-full!" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="brand" label="Бренд">
            <Input placeholder="PHENOMEN" />
          </Form.Item>

          <Form.Item name="categoryId" label="Категория">
            <Select
              allowClear
              placeholder="Без категории"
              options={categories.map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} placeholder="Короткое описание товара" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
