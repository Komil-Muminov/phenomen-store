import { useEffect } from 'react';
import { Form, Input, Modal, Radio } from 'antd';
import { UiMessages } from '@/shared/config';

export interface IPlatformUserValues {
  login: string;
  name: string;
  password: string;
  role: string;
}

interface IProps {
  open: boolean;
  isSaving: boolean;
  onSubmit: (values: IPlatformUserValues) => void;
  onCancel: () => void;
}

const PASSWORD_MIN = 8;

export const PlatformUserForm = ({ open, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<IPlatformUserValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ role: 'operator' });
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      title="Новый администратор платформы"
      okText="Создать"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="Имя"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Иван Иванов" autoFocus />
        </Form.Item>

        <Form.Item
          name="login"
          label="Логин"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="ivan" className="font-mono!" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            { required: true, message: UiMessages.required },
            { min: PASSWORD_MIN, message: `Минимум ${PASSWORD_MIN} символов` },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <Form.Item name="role" label="Права">
          <Radio.Group className="flex flex-col gap-2">
            <Radio value="operator">Оператор — только просмотр магазинов и журнала</Radio>
            <Radio value="superadmin">Суперадмин — полный доступ</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};
