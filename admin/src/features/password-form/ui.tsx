import { useCallback } from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { UiMessages } from '@/shared/config';

export interface IPasswordValues {
  currentPassword: string;
  newPassword: string;
}

interface IFormState extends IPasswordValues {
  repeatPassword: string;
}

interface IProps {
  isSaving: boolean;
  onSubmit: (values: IPasswordValues) => void;
}

const MIN_LENGTH = 8;

const PasswordTexts = {
  title: 'Пароль для входа',
  subtitle: 'Смените пароль, который вам выдали при создании магазина',
  current: 'Текущий пароль',
  next: 'Новый пароль',
  repeat: 'Повторите новый пароль',
  submit: 'Сменить пароль',
  mismatch: 'Пароли не совпадают',
  short: `Минимум ${MIN_LENGTH} символов`,
} as const;

export const PasswordForm = ({ isSaving, onSubmit }: IProps) => {
  const [form] = Form.useForm<IFormState>();

  const handleFinish = useCallback((state: IFormState) => {
    onSubmit({ currentPassword: state.currentPassword, newPassword: state.newPassword });
    form.resetFields();
  }, [onSubmit, form]);

  return (
    <Card className="mt-6! rounded-2xl! border-slate-200!">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
          <LockOutlined />
        </span>
        <div>
          <Typography.Text strong className="block text-slate-900!">
            {PasswordTexts.title}
          </Typography.Text>
          <Typography.Text className="text-sm! text-slate-500!">
            {PasswordTexts.subtitle}
          </Typography.Text>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
          <Form.Item
            name="currentPassword"
            label={PasswordTexts.current}
            rules={[{ required: true, message: UiMessages.required }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={PasswordTexts.next}
            rules={[
              { required: true, message: UiMessages.required },
              { min: MIN_LENGTH, message: PasswordTexts.short },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="repeatPassword"
            label={PasswordTexts.repeat}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: UiMessages.required },
              ({ getFieldValue }) => ({
                validator: (_rule, value) => (
                  !value || getFieldValue('newPassword') === value
                    ? Promise.resolve()
                    : Promise.reject(new Error(PasswordTexts.mismatch))
                ),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={isSaving} className="cursor-pointer!">
          {PasswordTexts.submit}
        </Button>
      </Form>
    </Card>
  );
};
