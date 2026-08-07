import { useEffect } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { TenantPlans, TenantVerticals, UiMessages } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

export interface ITenantFormValues {
  key: string;
  name: string;
  vertical: string;
  plan: string;
  bundleId?: string;
}

interface IProps {
  open: boolean;
  editing: ITenant | null;
  isSaving: boolean;
  onSubmit: (values: ITenantFormValues) => void;
  onCancel: () => void;
}

const KEY_PATTERN = /^[a-z0-9-]+$/;

export const TenantForm = ({ open, editing, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<ITenantFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        key: editing?.key ?? '',
        name: editing?.name ?? '',
        vertical: editing?.vertical ?? TenantVerticals[0],
        plan: editing?.plan ?? TenantPlans[0],
        bundleId: editing?.bundleId ?? '',
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      open={open}
      title={editing ? 'Редактирование магазина' : 'Новый магазин'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="key"
          label="Ключ магазина"
          rules={[
            { required: true, message: UiMessages.required },
            { pattern: KEY_PATTERN, message: 'Только строчные латинские буквы, цифры и дефис' },
          ]}
        >
          <Input placeholder="my-shop" disabled={Boolean(editing)} className="font-mono!" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Мой магазин" />
        </Form.Item>

        <Form.Item name="vertical" label="Вертикаль">
          <Select options={TenantVerticals.map((item) => ({ value: item, label: item }))} />
        </Form.Item>

        <Form.Item name="plan" label="Тарифный план">
          <Select options={TenantPlans.map((item) => ({ value: item, label: item }))} />
        </Form.Item>

        <Form.Item name="bundleId" label="Bundle ID">
          <Input placeholder="store.phenomen.myshop" className="font-mono!" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
