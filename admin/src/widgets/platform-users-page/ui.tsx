import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { PlatformUserForm, IPlatformUserValues } from '@/features/platform-user-form';
import { PlatformShell } from '@/widgets/platform-shell';
import type { IPlatformUser } from '@/entities/tenant';

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'суперадмин',
  operator: 'оператор',
};

export const PlatformUsersPage = () => {
  const { message } = AntApp.useApp();
  const [formOpen, setFormOpen] = useState(false);

  const usersQuery = useGetQuery<IPlatformUser[]>([QueryKeys.platformUsers], ApiRoutes.platformUsers);
  const createMutation = useMutationQuery<IPlatformUserValues, IPlatformUser>(
    ApiRoutes.platformUserCreate,
    { invalidate: [[QueryKeys.platformUsers]] },
  );

  const handleSubmit = useCallback((values: IPlatformUserValues) => {
    createMutation.mutate(values, {
      onSuccess: (created) => {
        message.success(`Администратор ${created.login} создан`);
        setFormOpen(false);
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [createMutation, message]);

  return (
    <PlatformShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Администраторы платформы
          </Typography.Title>
          <Typography.Text type="secondary">
            Всего: {usersQuery.data?.length ?? 0}
          </Typography.Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFormOpen(true)}
          className="cursor-pointer! transition-colors! duration-200!"
        >
          Новый администратор
        </Button>
      </header>

      <If condition={Boolean(usersQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(usersQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <Table<IPlatformUser>
          rowKey="id"
          size="middle"
          pagination={false}
          loading={usersQuery.isLoading}
          dataSource={usersQuery.data ?? []}
          columns={[
            { title: 'Имя', dataIndex: 'name', key: 'name' },
            {
              title: 'Логин',
              dataIndex: 'login',
              key: 'login',
              render: (value: string) => (
                <span className="font-mono text-sm text-violet-700">{value}</span>
              ),
            },
            {
              title: 'Права',
              dataIndex: 'role',
              key: 'role',
              render: (value: string) => (
                <Tag color={value === 'superadmin' ? 'gold' : 'default'}>
                  {ROLE_LABELS[value] ?? value}
                </Tag>
              ),
            },
            {
              title: 'Статус',
              dataIndex: 'status',
              key: 'status',
              render: (value: string) => (
                <Tag color={value === 'active' ? 'green' : 'red'}>
                  {value === 'active' ? 'активен' : 'отключён'}
                </Tag>
              ),
            },
          ]}
        />
      </section>

      <PlatformUserForm
        open={formOpen}
        isSaving={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
      />
    </PlatformShell>
  );
};
