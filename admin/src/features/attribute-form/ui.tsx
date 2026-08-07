import { useEffect } from 'react';
import { Alert, Form, Input, InputNumber, Modal, Radio, Select } from 'antd';
import { If } from '@/shared/ui/If';
import { UiMessages } from '@/shared/config';
import type { IShopAttribute } from '@/entities/shop';

export interface IAttributeFormValues {
  name: string;
  isVariantOption: boolean;
  position: number;
  values: string[];
}

interface IProps {
  open: boolean;
  editing: IShopAttribute | null;
  isSaving: boolean;
  onSubmit: (values: IAttributeFormValues) => void;
  onCancel: () => void;
}

export const AttributeForm = ({ open, editing, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<IAttributeFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? '',
        isVariantOption: editing?.isVariantOption ?? false,
        position: editing?.position ?? 100,
        values: editing?.values ?? [],
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      open={open}
      title={editing ? 'Изменение характеристики' : 'Новая характеристика'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
      width={620}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Размер" autoFocus />
        </Form.Item>

        <Form.Item name="isVariantOption" label="Для чего используется">
          <Radio.Group disabled={Boolean(editing)} className="flex flex-col gap-2">
            <Radio value={false}>
              Характеристика — просто описание товара
            </Radio>
            <Radio value={true}>
              Варианты — товар выпускается в нескольких исполнениях
            </Radio>
          </Radio.Group>
        </Form.Item>

        <If condition={Boolean(editing)}>
          <Alert
            type="info"
            showIcon
            className="mb-4!"
            message="Назначение менять нельзя — от него зависят уже созданные товары"
          />
        </If>

        <Form.Item
          name="values"
          label="Значения"
          extra="Удалите лишние или добавьте свои. Новые появляются сами при вводе в карточке товара."
        >
          <Select
            mode="tags"
            placeholder="S, M, L"
            className="w-full"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="position" label="Порядок в списке">
          <InputNumber min={0} step={10} className="w-full!" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
