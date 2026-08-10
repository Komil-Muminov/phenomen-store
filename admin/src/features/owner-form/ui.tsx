import { useEffect } from 'react';
import { Alert, Form, Input, Modal, Select, Typography } from 'antd';
import { EntityStatuses, StaffRoleLabels, UiMessages } from '@/shared/config';
import { If } from '@/shared/ui/If';
import type { ITenant, ITenantStaff } from '@/entities/tenant';

export interface IOwnerFormValues {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: string;
}

interface IProps {
  open: boolean;
  tenant: ITenant | null;
  editing: ITenantStaff | null;
  isSaving: boolean;
  onSubmit: (values: IOwnerFormValues) => void;
  onCancel: () => void;
}

const PASSWORD_MIN = 6;

const STATUS_OPTIONS = [
  { value: EntityStatuses.active, label: 'активен' },
  { value: EntityStatuses.disabled, label: 'доступ отключён' },
];

export const OwnerForm = ({
  open,
  tenant,
  editing,
  isSaving,
  onSubmit,
  onCancel,
}: IProps) => {
  const [form] = Form.useForm<IOwnerFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? '',
        email: editing?.email ?? '',
        phone: editing?.phone ?? '',
        password: '',
        status: editing?.status ?? EntityStatuses.active,
      });
    }
  }, [open, editing, form]);

  return (
    <Modal
      open={open}
      title={editing ? `Сотрудник: ${StaffRoleLabels[editing.role] ?? editing.role}` : 'Новый владелец магазина'}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary" className="mb-4!">
        Магазин <span className="font-mono">{tenant?.key}</span>. Вход в кабинет и в приложение —
        по email или телефону с этим паролем.
      </Typography.Paragraph>

      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="Имя"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Иван Иванов" autoFocus />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          dependencies={['phone']}
          rules={[
            { type: 'email', message: 'Некорректный email' },
            {
              validator: (_rule, value) => (
                value || form.getFieldValue('phone')
                  ? Promise.resolve()
                  : Promise.reject(new Error('Заполните email или телефон'))
              ),
            },
          ]}
        >
          <Input placeholder="owner@shop.ru" autoComplete="off" />
        </Form.Item>

        <Form.Item name="phone" label="Телефон">
          <Input placeholder="+992 00 000 0000" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="password"
          label={editing ? 'Новый пароль' : 'Пароль'}
          extra={editing ? 'Оставьте пустым, чтобы не менять пароль' : undefined}
          rules={[
            { required: !editing, message: UiMessages.required },
            {
              validator: (_rule, value) => (
                !value || String(value).length >= PASSWORD_MIN
                  ? Promise.resolve()
                  : Promise.reject(new Error(`Минимум ${PASSWORD_MIN} символов`))
              ),
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <If condition={Boolean(editing)}>
          <Form.Item name="status" label="Доступ">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </If>

        <If condition={!editing}>
          <Alert
            type="info"
            showIcon
            message="Логин выдаётся сразу — сотрудник заходит на ту же страницу входа, что и вы"
          />
        </If>
      </Form>
    </Modal>
  );
};
