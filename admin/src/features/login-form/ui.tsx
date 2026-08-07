import { Alert, Button, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { If } from '@/shared/ui/If';
import { UiMessages } from '@/shared/config';

export interface ILoginValues {
  login: string;
  password: string;
}

interface IProps {
  onSubmit: (values: ILoginValues) => void;
  isLoading: boolean;
  errorText: string;
}

export const LoginForm = ({ onSubmit, isLoading, errorText }: IProps) => (
  <section className="w-full max-w-md rounded-xl border border-violet-200 bg-white p-8 shadow-sm">
    <header className="mb-6">
      <Typography.Title level={3} className="mb-1! text-brand-text!">
        Панель платформы
      </Typography.Title>
      <Typography.Text type="secondary">
        Управление магазинами PHENOMEN
      </Typography.Text>
    </header>

    <If condition={Boolean(errorText)}>
      <Alert type="error" message={errorText} showIcon className="mb-4!" />
    </If>

    <Form layout="vertical" onFinish={onSubmit} requiredMark={false} disabled={isLoading}>
      <Form.Item
        name="login"
        label="Логин"
        rules={[{ required: true, message: UiMessages.required }]}
      >
        <Input
          size="large"
          prefix={<UserOutlined className="text-violet-400" />}
          placeholder="km"
          autoComplete="username"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Пароль"
        rules={[{ required: true, message: UiMessages.required }]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-violet-400" />}
          placeholder="Пароль"
          autoComplete="current-password"
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        loading={isLoading}
        className="cursor-pointer! transition-colors! duration-200!"
      >
        Войти
      </Button>
    </Form>
  </section>
);
