import { useState } from 'react';
import { Alert, Button, Input, Typography } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { TenantStatuses } from '@/shared/config';
import { If } from '@/shared/ui/If';
import { CardTitles, ITenantCardHandlers } from '@/features/tenant-card/model';
import type { ITenant } from '@/entities/tenant';

interface IProps {
  tenant: ITenant;
  isStatusSaving: boolean;
  isDeleting: boolean;
  onToggleStatus: ITenantCardHandlers['onToggleStatus'];
  onDelete: ITenantCardHandlers['onDelete'];
}

export const RenderDanger = ({
  tenant,
  isStatusSaving,
  isDeleting,
  onToggleStatus,
  onDelete,
}: IProps) => {
  const [confirmKey, setConfirmKey] = useState('');
  const isActive = tenant.status === TenantStatuses.active;

  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
      <Typography.Text strong className="text-brand-text!">
        {CardTitles.danger}
      </Typography.Text>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
        <div className="min-w-0">
          <div className="font-medium">
            {isActive ? 'Магазин работает' : 'Магазин отключён'}
          </div>
          <Typography.Text type="secondary" className="text-xs!">
            Отключённый магазин не пускает покупателей и сотрудников, данные остаются на месте
          </Typography.Text>
        </div>

        <Button
          danger={isActive}
          loading={isStatusSaving}
          icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
          onClick={() => onToggleStatus(tenant)}
          className="cursor-pointer!"
        >
          {isActive ? 'Отключить' : 'Включить'}
        </Button>
      </div>

      <div className="mt-4">
        <Alert
          type="error"
          showIcon
          className="mb-3!"
          message="Удаление магазина необратимо"
          description="Вместе с магазином исчезнут товары, заказы, баннеры и сотрудники. Введите ключ магазина, чтобы подтвердить."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={confirmKey}
            placeholder={tenant.key}
            onChange={(event) => setConfirmKey(event.target.value)}
            className="max-w-56 font-mono!"
          />

          <Button
            danger
            type="primary"
            loading={isDeleting}
            disabled={confirmKey.trim().toLowerCase() !== tenant.key}
            icon={<DeleteOutlined />}
            onClick={() => onDelete(confirmKey.trim().toLowerCase())}
            className="cursor-pointer!"
          >
            Удалить магазин
          </Button>
        </div>

        <If condition={Boolean(confirmKey) && confirmKey.trim().toLowerCase() !== tenant.key}>
          <Typography.Text type="secondary" className="mt-2! block text-xs!">
            Ключ не совпадает — кнопка останется заблокированной
          </Typography.Text>
        </If>
      </div>
    </section>
  );
};
