import { useEffect } from 'react';
import { Alert, Divider, Form, Input, Modal, Select } from 'antd';
import { TenantVerticals, UiMessages } from '@/shared/config';
import { PlanOptions } from '@/entities/plan';

export interface ITenantFormValues {
  key: string;
  name: string;
  vertical: string;
  plan: string;
  bundleId?: string;
  ownerName: string;
  ownerLogin: string;
  ownerPassword: string;
}

interface IProps {
  open: boolean;
  isSaving: boolean;
  onSubmit: (values: ITenantFormValues) => void;
  onCancel: () => void;
}

const KEY_PATTERN = /^[a-z0-9-]+$/;

const OWNER_PASSWORD_MIN = 8;

export const TenantForm = ({ open, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<ITenantFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        key: '',
        name: '',
        vertical: TenantVerticals[0],
        plan: PlanOptions[0].value,
        bundleId: '',
        ownerName: '',
        ownerLogin: '',
        ownerPassword: '',
      });
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      title="Новый магазин"
      okText="Создать магазин"
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
          extra="Менять потом нельзя — по нему магазин узнают приложение и кабинет"
          rules={[
            { required: true, message: UiMessages.required },
            { pattern: KEY_PATTERN, message: 'Только строчные латинские буквы, цифры и дефис' },
          ]}
        >
          <Input placeholder="my-shop" autoFocus className="font-mono!" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Мой магазин" />
        </Form.Item>

        <div className="flex flex-wrap gap-3">
          <Form.Item name="vertical" label="Вертикаль" className="min-w-40 flex-1">
            <Select options={TenantVerticals.map((item) => ({ value: item, label: item }))} />
          </Form.Item>

          <Form.Item name="plan" label="Тарифный план" className="min-w-40 flex-1">
            <Select options={PlanOptions} />
          </Form.Item>
        </div>

        <Form.Item name="bundleId" label="Bundle ID">
          <Input placeholder="store.phenomen.myshop" className="font-mono!" />
        </Form.Item>

        <Divider className="mt-2! mb-4!">Админ магазина</Divider>

        <Alert
          type="info"
          showIcon
          className="mb-4!"
          message="Админ создаётся сразу вместе с магазином и входит на этой же странице входа. Второго админа добавить нельзя — данные этого можно будет изменить в карточке магазина."
        />

        <Form.Item
          name="ownerName"
          label="Имя админа"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Иван Иванов" />
        </Form.Item>

        <Form.Item
          name="ownerLogin"
          label="Логин — email или телефон"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="owner@shop.ru" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="ownerPassword"
          label="Пароль"
          rules={[
            { required: true, message: UiMessages.required },
            { min: OWNER_PASSWORD_MIN, message: `Минимум ${OWNER_PASSWORD_MIN} символов` },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
