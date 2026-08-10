import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Select } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys } from '@/shared/config';
import { useGetQuery, useListQuery, useMutationQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import { StockTable } from '@/features/stock-table';
import { ShopShell } from '@/widgets/shop-shell';
import type { IStockItem, IStockList } from '@/entities/shop';

const STOCK_FILTER_OPTIONS = [
  { value: 'all', label: 'Все позиции' },
  { value: 'empty', label: 'Только закончившиеся' },
];

export const ShopStockPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState('');
  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    onlyEmpty: undefined as boolean | undefined,
  });

  const stockQuery = useGetQuery<IStockList>(
    [QueryKeys.shopStock, ...buildListKey(applied)],
    ApiRoutes.shopStockSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.stock) },
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

  const handleOnlyEmpty = useCallback((value: string) => {
    setFilter({ onlyEmpty: value === 'empty' ? true : undefined });
  }, [setFilter]);

  const items = stockQuery.data?.items ?? [];
  const total = stockQuery.data?.total ?? 0;

  return (
    <ShopShell>
      <ListToolbar
        title="Остатки"
        subtitle={`Найдено позиций: ${total}`}
        search={draft.search}
        searchPlaceholder="Название товара или SKU"
        isFetching={stockQuery.isFetching}
        onSearch={setSearch}
        onRefresh={handleRefresh}
        filters={(
          <Select
            value={draft.onlyEmpty ? 'empty' : 'all'}
            onChange={handleOnlyEmpty}
            className="min-w-52"
            options={STOCK_FILTER_OPTIONS}
          />
        )}
      />

      <If condition={Boolean(stockQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(stockQuery.error)}
        />
      </If>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xs overflow-hidden">
        <StockTable
          items={items}
          isLoading={stockQuery.isLoading}
          savingId={savingId}
          onChange={handleChange}
        />
      </section>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.stock}
        total={total}
        onChange={setPage}
      />
    </ShopShell>
  );
};
