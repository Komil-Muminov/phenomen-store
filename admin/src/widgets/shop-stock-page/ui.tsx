import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, Pagination, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { StockTable } from '@/features/stock-table';
import { ShopShell } from '@/widgets/shop-shell';
import type { IStockItem, IStockList } from '@/entities/shop';

const STOCK_LIMIT = 200;

export const ShopStockPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState('');

  const stockQuery = useGetQuery<IStockList>(
    [QueryKeys.shopStock],
    ApiRoutes.shopStockSearch,
    { scope: 'shop', params: { limit: STOCK_LIMIT, page: Pagination.defaultPage } },
  );

  const stockMutation = useMutationQuery<{ id: string; stock: number }, IStockItem>(
    (body) => `${ApiRoutes.shopStockUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate: [[QueryKeys.shopStock], [QueryKeys.shopProducts]] },
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopStock] });
  }, [queryClient]);

  const handleChange = useCallback((item: IStockItem, stock: number) => {
    setSavingId(item.id);

    stockMutation.mutate({ id: item.id, stock }, {
      onError: (error) => message.error(extractErrorMessage(error)),
      onSettled: () => setSavingId(''),
    });
  }, [stockMutation, message]);

  const items = stockQuery.data?.items ?? [];
  const empty = items.filter((item) => item.stock === 0).length;

  return (
    <ShopShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Остатки
          </Typography.Title>
          <Typography.Text type="secondary">
            Позиций: {stockQuery.data?.total ?? 0} · закончилось: {empty}
          </Typography.Text>
        </div>

        <Tooltip title="Обновить">
          <Button
            aria-label="Обновить остатки"
            icon={<ReloadOutlined />}
            loading={stockQuery.isFetching}
            onClick={handleRefresh}
            className="cursor-pointer!"
          />
        </Tooltip>
      </header>

      <If condition={Boolean(stockQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(stockQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <StockTable
          items={items}
          isLoading={stockQuery.isLoading}
          savingId={savingId}
          onChange={handleChange}
        />
      </section>
    </ShopShell>
  );
};
