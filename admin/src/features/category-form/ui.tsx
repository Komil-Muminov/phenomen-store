import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { UiMessages } from '@/shared/config';
import type { IShopCategory } from '@/entities/shop';

export interface ICategoryFormValues {
  name: string;
  parentId?: string | null;
  imageUrl?: string;
  position: number;
}

interface IProps {
  open: boolean;
  editing: IShopCategory | null;
  categories: IShopCategory[];
  isSaving: boolean;
  onSubmit: (values: ICategoryFormValues) => void;
  onCancel: () => void;
}

export const CategoryForm = ({
  open,
  editing,
  categories,
  isSaving,
  onSubmit,
  onCancel,
}: IProps) => {
  const [form] = Form.useForm<ICategoryFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? '',
        parentId: editing?.parentId ?? null,
        imageUrl: editing?.imageUrl ?? '',
        position: editing?.position ?? 100,
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      open={open}
      title={editing ? 'Изменение категории' : 'Новая категория'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Женщинам" autoFocus />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="Вложить в категорию"
          extra="Оставьте пустым, чтобы категория была на верхнем уровне"
        >
          <Select
            allowClear
            placeholder="Верхний уровень"
            options={categories
              .filter((item) => item.id !== editing?.id)
              .map((item) => ({ value: item.id, label: item.name }))}
          />
        </Form.Item>

        <Form.Item name="imageUrl" label="Ссылка на картинку">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          name="position"
          label="Порядок в списке"
          extra="Чем меньше число, тем выше категория в каталоге"
        >
          <InputNumber min={0} step={10} className="w-full!" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
