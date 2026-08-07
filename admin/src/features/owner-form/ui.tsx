import { useEffect } from 'react';
import { Form, Input, Modal, Typography } from 'antd';
import { UiMessages } from '@/shared/config';
import type { ITenant } from '@/entities/tenant';

export interface IOwnerFormValues {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface IProps {
  open: boolean;
  tenant: ITenant | null;
  isSaving: boolean;
  onSubmit: (values: IOwnerFormValues) => void;
  onCancel: () => void;
}

const PASSWORD_MIN = 6;

export const OwnerForm = ({ open, tenant, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<IOwnerFormValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      title="Владелец магазина"
      okText="Создать"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary" className="mb-4!">
        Магазин: <span className="font-mono">{tenant?.key}</span>. Владелец сможет войти в
        приложение по email или телефону с этим паролем.
      </Typography.Paragraph>

      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="Имя"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Иван Иванов" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: UiMessages.required },
            { type: 'email', message: 'Некорректный email' },
          ]}
        >
          <Input placeholder="owner@shop.ru" autoComplete="off" />
        </Form.Item>

        <Form.Item name="phone" label="Телефон">
          <Input placeholder="+7 900 000-00-00" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            { required: true, message: UiMessages.required },
            { min: PASSWORD_MIN, message: `Минимум ${PASSWORD_MIN} символов` },
          ]}
        >
          <Input.Password placeholder="Пароль для входа" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
