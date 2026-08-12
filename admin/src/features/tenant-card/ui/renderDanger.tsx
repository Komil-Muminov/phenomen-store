import { useState } from 'react';
import { Button, Input, Typography } from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  StopOutlined,
} from '@ant-design/icons';
import { EntityStatuses } from '@/shared/config';
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
  const isActive = tenant.status === EntityStatuses.active;
  const isKeyValid = confirmKey.trim().toLowerCase() === tenant.key.toLowerCase();

  return (
    <section className="rounded-xl border border-rose-200 bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <Typography.Text strong className="text-rose-700! text-sm font-semibold">
          {CardTitles.danger}
        </Typography.Text>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900">
            {isActive ? 'Магазин работает' : 'Магазин отключён'}
          </div>
          <Typography.Text type="secondary" className="text-xs! text-slate-500">
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
        <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3.5">
          <div className="flex items-start gap-2.5">
            <ExclamationCircleFilled className="mt-0.5 shrink-0 text-base text-rose-500" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-rose-900">
                Удаление магазина необратимо
              </div>
              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                Вместе с магазином исчезнут товары, заказы, баннеры и сотрудники. Чтобы подтвердить, введите ключ магазина{' '}
                <code className="select-all rounded border border-rose-200/80 bg-rose-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-rose-800">
                  {tenant.key}
                </code>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Input
                  value={confirmKey}
                  placeholder={tenant.key}
                  onChange={(event) => setConfirmKey(event.target.value)}
                  className="max-w-56 font-mono! text-sm"
                  status={confirmKey && !isKeyValid ? 'error' : ''}
                />

                <Button
                  danger
                  type="primary"
                  loading={isDeleting}
                  disabled={!isKeyValid}
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(confirmKey.trim().toLowerCase())}
                  className="cursor-pointer!"
                >
                  Удалить магазин
                </Button>
              </div>

              <If condition={Boolean(confirmKey) && !isKeyValid}>
                <Typography.Text type="danger" className="mt-2! block text-xs!">
                  Ключ не совпадает — кнопка останется заблокированной
                </Typography.Text>
              </If>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

