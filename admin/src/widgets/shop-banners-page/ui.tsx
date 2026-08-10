import { useCallback, useState } from 'react';
import { Alert, App as AntApp } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, StaleTimeMs, UiMessages } from '@/shared/config';
import { useGetQuery, useListQuery } from '@/shared/hooks';
import { buildListKey, buildListParams, parseVisibility } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { BannersTable } from '@/features/banners-table';
import { BannerForm, IBannerFormValues } from '@/features/banner-form';
import { ShopShell } from '@/widgets/shop-shell';
import { useBannerMutations } from '@/widgets/shop-banners-page/lib';
import { RenderToolbar } from '@/widgets/shop-banners-page/ui/renderToolbar';
import type {
  IShopBanner,
  IShopBannerList,
  IShopCategory,
  IShopProductList,
} from '@/entities/shop';

export const ShopBannersPage = () => {
  const { message, modal } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopBanner | null>(null);

  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    isActive: undefined as boolean | undefined,
  });

  const bannersQuery = useGetQuery<IShopBannerList>(
    [QueryKeys.shopBanners, ...buildListKey(applied)],
    ApiRoutes.shopBannersManage,
    { scope: 'shop', params: buildListParams(applied, ListLimits.banners) },
  );
  const categoriesQuery = useGetQuery<IShopCategory[]>(
    [QueryKeys.shopCategories],
    ApiRoutes.shopCategoriesSearch,
    { scope: 'shop', staleTime: StaleTimeMs.long },
  );
  const productsQuery = useGetQuery<IShopProductList>(
    [QueryKeys.shopProducts],
    ApiRoutes.shopProductsSearch,
    { scope: 'shop', staleTime: StaleTimeMs.long },
  );

  const mutations = useBannerMutations();

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((banner: IShopBanner) => {
    setEditing(banner);
    setFormOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopBanners] });
  }, [queryClient]);

  const handleDeactivate = useCallback((banner: IShopBanner) => {
    mutations.deactivate.mutate({ id: banner.id }, {
      onSuccess: () => message.success(UiMessages.hiddenBanner),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.deactivate, message]);

  const handleReorder = useCallback((ids: string[]) => {
    mutations.reorder.mutate({ ids }, {
      onSuccess: () => message.success(UiMessages.reorderedBanners),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.reorder, message]);

  const handleDelete = useCallback((banner: IShopBanner) => {
    modal.confirm({
      title: banner.title ? `Удалить баннер «${banner.title}»?` : 'Удалить баннер?',
      content: 'Баннер пропадёт из карусели навсегда. Чтобы убрать его временно, используйте «Скрыть».',
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => new Promise<void>((resolve) => {
        mutations.remove.mutate({ id: banner.id }, {
          onSuccess: () => message.success(UiMessages.deletedBanner),
          onError: (error) => message.error(extractErrorMessage(error)),
          onSettled: () => resolve(),
        });
      }),
    });
  }, [mutations.remove, modal, message]);

  const handleSubmit = useCallback((values: IBannerFormValues) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (editing) {
      mutations.update.mutate({ ...values, id: editing.id }, {
        onSuccess: () => {
          message.success(UiMessages.updatedBanner);
          closeForm();
        },
        onError,
      });

      return;
    }

    mutations.create.mutate(values, {
      onSuccess: () => {
        message.success(UiMessages.createdBanner);
        closeForm();
      },
      onError,
    });
  }, [editing, mutations.update, mutations.create, message, closeForm]);

  const handleVisibility = useCallback((value: string) => {
    setFilter({ isActive: parseVisibility(value) });
  }, [setFilter]);

  const items = bannersQuery.data?.items ?? [];
  const total = bannersQuery.data?.total ?? 0;
  const products = productsQuery.data?.items ?? [];
  const canReorder = applied.page === 1 && !applied.search && applied.isActive === undefined;

  return (
    <ShopShell>
      <RenderToolbar
        total={total}
        search={draft.search}
        isActive={draft.isActive}
        isFetching={bannersQuery.isFetching}
        canReorder={canReorder}
        onSearch={setSearch}
        onVisibility={handleVisibility}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />

      <If condition={Boolean(bannersQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(bannersQuery.error)}
        />
      </If>

      <If condition={!bannersQuery.isLoading && total === 0 && !applied.search}>
        <Alert
          type="info"
          showIcon
          className="mb-4!"
          message="Карусель на главной пустая"
          description="Добавьте баннер ссылкой на картинку — он появится в приложении после обновления главной."
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <BannersTable
          items={items}
          categories={categoriesQuery.data ?? []}
          products={products}
          isLoading={bannersQuery.isLoading || mutations.reorder.isPending}
          canReorder={canReorder}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      </section>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.banners}
        total={total}
        onChange={setPage}
      />

      <BannerForm
        open={formOpen}
        editing={editing}
        categories={categoriesQuery.data ?? []}
        products={products}
        isSaving={mutations.create.isPending || mutations.update.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </ShopShell>
  );
};
