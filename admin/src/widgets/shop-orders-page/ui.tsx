import { useCallback, useEffect, useState } from 'react';
import { Alert, App as AntApp, Select } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import {
  ApiRoutes,
  ListLimits,
  OrderStatusLabels,
  OrderStatuses,
  QueryKeys,
} from '@/shared/config';
import { useGetQuery, useListQuery, useMutationQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import { OrdersTable } from '@/features/orders-table';
import {
  EMPTY_DELIVERY,
  IDeliveryValues,
  OrderDrawer,
  readDelivery,
} from '@/features/order-drawer';
import type { IOrder, IOrderDetail, IOrderList, IOrderPayment } from '@/entities/shop';

interface IStatusBody {
  id: string;
  status: string;
}

export const ShopOrdersPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [delivery, setDelivery] = useState<IDeliveryValues>(EMPTY_DELIVERY);
  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    status: undefined as string | undefined,
  });

  const ordersQuery = useGetQuery<IOrderList>(
    [QueryKeys.shopOrders, ...buildListKey(applied)],
    ApiRoutes.shopOrdersSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const statusMutation = useMutationQuery<IStatusBody, IOrder>(
    (body) => `${ApiRoutes.shopOrderStatus}/${body.id}`,
    { scope: 'shop', invalidate: [[QueryKeys.shopOrders]] },
  );

  const detailQuery = useGetQuery<IOrderDetail>(
    [QueryKeys.shopOrder, openId],
    `${ApiRoutes.shopOrderGet}/${openId}`,
    { scope: 'shop', enabled: Boolean(openId) },
  );

  const reviewMutation = useMutationQuery<
    { id: string; accepted: boolean; note: string },
    IOrderPayment
  >(
    (body) => `${ApiRoutes.shopPaymentReview}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: [[QueryKeys.shopOrders]] },
  );

  const deliveryMutation = useMutationQuery<IDeliveryValues & { id: string }, IOrderDetail>(
    (body) => `${ApiRoutes.shopOrderDelivery}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: [[QueryKeys.shopOrders]] },
  );

  const handleOpen = useCallback((order: IOrder) => {
    setOpenId(order.id);
    setReviewNote('');
    setDelivery({ ...EMPTY_DELIVERY, status: order.deliveryStatus });
  }, []);

  useEffect(() => {
    if (detailQuery.data) {
      setDelivery((current) => ({
        ...current,
        ...readDelivery(detailQuery.data?.delivery ?? null),
        status: detailQuery.data?.deliveryStatus ?? current.status,
      }));
    }
  }, [detailQuery.data]);

  const handleReview = useCallback((accepted: boolean) => {
    if (!openId) {
      return;
    }

    reviewMutation.mutate({ id: openId, accepted, note: reviewNote.trim() }, {
      onSuccess: () => {
        message.success(accepted ? 'Оплата подтверждена' : 'Оплата отклонена');
        detailQuery.refetch();
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [openId, reviewNote, reviewMutation, message, detailQuery]);

  const handleSaveDelivery = useCallback(() => {
    if (!openId) {
      return;
    }

    deliveryMutation.mutate({ ...delivery, id: openId }, {
      onSuccess: () => {
        message.success('Доставка обновлена');
        detailQuery.refetch();
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [openId, delivery, deliveryMutation, message, detailQuery]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopOrders] });
  }, [queryClient]);

  const handleStatusFilter = useCallback((status: string | undefined) => {
    setFilter({ status });
  }, [setFilter]);

  const handleStatusChange = useCallback((order: IOrder, status: string) => {
    setSavingId(order.id);

    statusMutation.mutate({ id: order.id, status }, {
      onSuccess: () => message.success(`Заказ ${order.number}: ${OrderStatusLabels[status] ?? status}`),
      onError: (error) => message.error(extractErrorMessage(error)),
      onSettled: () => setSavingId(''),
    });
  }, [statusMutation, message]);

  return (
    <>
      <ListToolbar
        title="Заказы"
        subtitle={`Найдено: ${ordersQuery.data?.total ?? 0}`}
        search={draft.search}
        searchPlaceholder="Номер, имя или телефон"
        isFetching={ordersQuery.isFetching}
        onSearch={setSearch}
        onRefresh={handleRefresh}
        filters={(
          <Select
            allowClear
            placeholder="Все статусы"
            value={draft.status}
            onChange={handleStatusFilter}
            className="min-w-44"
            options={OrderStatuses.map((status) => ({
              value: status,
              label: OrderStatusLabels[status] ?? status,
            }))}
          />
        )}
      />

      <If condition={Boolean(ordersQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(ordersQuery.error)}
        />
      </If>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xs overflow-hidden">
        <OrdersTable
          items={ordersQuery.data?.items ?? []}
          isLoading={ordersQuery.isLoading}
          savingId={savingId}
          onStatusChange={handleStatusChange}
          onOpen={handleOpen}
        />
      </section>

      <OrderDrawer
        order={detailQuery.data ?? null}
        isOpen={Boolean(openId)}
        isLoading={detailQuery.isLoading}
        delivery={delivery}
        note={reviewNote}
        isReviewing={reviewMutation.isPending}
        isSavingDelivery={deliveryMutation.isPending}
        onNote={setReviewNote}
        onReview={handleReview}
        onDelivery={setDelivery}
        onSaveDelivery={handleSaveDelivery}
        onClose={() => setOpenId(null)}
      />

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={ordersQuery.data?.total ?? 0}
        onChange={setPage}
      />
    </>
  );
};
