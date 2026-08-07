import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Select, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, OrderStatusLabels, OrderStatuses, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { OrdersTable } from '@/features/orders-table';
import { ShopShell } from '@/widgets/shop-shell';
import type { IOrder, IOrderList } from '@/entities/shop';

interface IStatusBody {
  id: string;
  status: string;
}

export const ShopOrdersPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [savingId, setSavingId] = useState('');

  const ordersQuery = useGetQuery<IOrderList>(
    [QueryKeys.shopOrders, statusFilter ?? null],
    ApiRoutes.shopOrdersSearch,
    { scope: 'shop', params: statusFilter ? { status: statusFilter } : undefined },
  );

  const statusMutation = useMutationQuery<IStatusBody, IOrder>(
    (body) => `${ApiRoutes.shopOrderStatus}/${body.id}`,
    { scope: 'shop', invalidate: [[QueryKeys.shopOrders]] },
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopOrders] });
  }, [queryClient]);

  const handleStatusChange = useCallback((order: IOrder, status: string) => {
    setSavingId(order.id);

    statusMutation.mutate({ id: order.id, status }, {
      onSuccess: () => message.success(`Заказ ${order.number}: ${OrderStatusLabels[status] ?? status}`),
      onError: (error) => message.error(extractErrorMessage(error)),
      onSettled: () => setSavingId(''),
    });
  }, [statusMutation, message]);

  return (
    <ShopShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Заказы
          </Typography.Title>
          <Typography.Text type="secondary">Всего: {ordersQuery.data?.total ?? 0}</Typography.Text>
        </div>

        <div className="flex items-center gap-2">
          <Select
            allowClear
            placeholder="Все статусы"
            value={statusFilter}
            onChange={setStatusFilter}
            className="min-w-44"
            options={OrderStatuses.map((status) => ({
              value: status,
              label: OrderStatusLabels[status] ?? status,
            }))}
          />

          <Tooltip title="Обновить">
            <Button
              aria-label="Обновить список заказов"
              icon={<ReloadOutlined />}
              loading={ordersQuery.isFetching}
              onClick={handleRefresh}
              className="cursor-pointer!"
            />
          </Tooltip>
        </div>
      </header>

      <If condition={Boolean(ordersQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(ordersQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <OrdersTable
          items={ordersQuery.data?.items ?? []}
          isLoading={ordersQuery.isLoading}
          savingId={savingId}
          onStatusChange={handleStatusChange}
        />
      </section>
    </ShopShell>
  );
};
