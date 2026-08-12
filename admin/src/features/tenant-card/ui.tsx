import { useEffect } from 'react';
import { Button, Drawer, Form, Input, Select, Tag, Typography } from 'antd';
import { LoginOutlined, SaveOutlined } from '@ant-design/icons';
import { EntityStatuses, TenantPlans, TenantVerticals, UiMessages } from '@/shared/config';
import { If } from '@/shared/ui/If';
import { RenderStaff } from '@/features/tenant-card/ui/renderStaff';
import { RenderDanger } from '@/features/tenant-card/ui/renderDanger';
import {
  CardTitles,
  DRAWER_WIDTH,
  ITenantCardHandlers,
  ITenantCardValues,
} from '@/features/tenant-card/model';
import type { ITenant, ITenantStaff } from '@/entities/tenant';

interface IProps extends ITenantCardHandlers {
  open: boolean;
  tenant: ITenant | null;
  staff: ITenantStaff[];
  isStaffLoading: boolean;
  isSaving: boolean;
  isStatusSaving: boolean;
  isDeleting: boolean;
  isEntering: boolean;
  onClose: () => void;
}

export const TenantCard = ({
  open,
  tenant,
  staff,
  isStaffLoading,
  isSaving,
  isStatusSaving,
  isDeleting,
  isEntering,
  onSubmit,
  onEditStaff,
  onToggleStatus,
  onEnterShop,
  onDelete,
  onClose,
}: IProps) => {
  const [form] = Form.useForm<ITenantCardValues>();

  useEffect(() => {
    if (open && tenant) {
      form.setFieldsValue({
        name: tenant.name,
        vertical: tenant.vertical,
        plan: tenant.plan,
        bundleId: tenant.bundleId ?? '',
      });
    }
  }, [open, tenant, form]);

  return (
    <Drawer
      open={open}
      width={DRAWER_WIDTH}
      placement="right"
      onClose={onClose}
      title={(
        <div className="flex flex-wrap items-center gap-2">
          <span>{tenant?.name ?? 'Магазин'}</span>
          <span className="font-mono text-xs text-violet-500">{tenant?.key}</span>
          <If condition={tenant?.status !== EntityStatuses.active}>
            <Tag color="red">отключён</Tag>
          </If>
        </div>
      )}
      classNames={{ body: 'p-4!' }}
    >
      <If condition={Boolean(tenant)}>
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4 transition-colors hover:bg-violet-50">
          <div className="min-w-0">
            <div className="font-medium">{CardTitles.enter}</div>
            <Typography.Text type="secondary" className="text-xs!">
              Откроется кабинет магазина от имени его владельца, платформенная сессия сохранится
            </Typography.Text>
          </div>

          <Button
            type="primary"
            loading={isEntering}
            disabled={tenant?.status !== EntityStatuses.active}
            icon={<LoginOutlined />}
            onClick={() => onEnterShop(tenant as ITenant)}
            className="cursor-pointer!"
          >
            Войти в магазин
          </Button>
        </section>

        <section className="mb-6 rounded-xl border border-violet-200 p-4">
          <Typography.Text strong className="mb-3! block text-brand-text!">
            {CardTitles.main}
          </Typography.Text>

          <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
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

              <Form.Item name="plan" label="Тариф" className="min-w-40 flex-1">
                <Select options={TenantPlans.map((item) => ({ value: item, label: item }))} />
              </Form.Item>
            </div>

            <Form.Item name="bundleId" label="Bundle ID">
              <Input placeholder="store.phenomen.myshop" className="font-mono!" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
              icon={<SaveOutlined />}
              className="cursor-pointer!"
            >
              Сохранить
            </Button>
          </Form>
        </section>

        <RenderStaff
          staff={staff}
          isLoading={isStaffLoading}
          onEditStaff={onEditStaff}
        />

        <RenderDanger
          tenant={tenant as ITenant}
          isStatusSaving={isStatusSaving}
          isDeleting={isDeleting}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </If>
    </Drawer>
  );
};
