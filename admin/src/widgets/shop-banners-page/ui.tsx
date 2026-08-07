import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys, StaleTimeMs, UiMessages } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { BannersTable } from '@/features/banners-table';
import { BannerForm, IBannerFormValues } from '@/features/banner-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { IShopBanner, IShopCategory, IShopProductList } from '@/entities/shop';

export const ShopBannersPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopBanner | null>(null);

  const bannersQuery = useGetQuery<IShopBanner[]>(
    [QueryKeys.shopBanners],
    ApiRoutes.shopBannersManage,
    { scope: 'shop' },
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

  const invalidate = [[QueryKeys.shopBanners]];
  const createMutation = useMutationQuery<IBannerFormValues, IShopBanner>(
    ApiRoutes.shopBannerCreate,
    { scope: 'shop', invalidate },
  );
  const updateMutation = useMutationQuery<IBannerFormValues & { id: string }, IShopBanner>(
    (body) => `${ApiRoutes.shopBannerUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate },
  );
  const deactivateMutation = useMutationQuery<{ id: string }, IShopBanner>(
    (body) => `${ApiRoutes.shopBannerDeactivate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate },
  );

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
    deactivateMutation.mutate({ id: banner.id }, {
      onSuccess: () => message.success(UiMessages.hiddenBanner),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [deactivateMutation, message]);

  const handleSubmit = useCallback((values: IBannerFormValues) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (editing) {
      updateMutation.mutate({ ...values, id: editing.id }, {
        onSuccess: () => {
          message.success(UiMessages.updatedBanner);
          closeForm();
        },
        onError,
      });

      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        message.success(UiMessages.createdBanner);
        closeForm();
      },
      onError,
    });
  }, [editing, updateMutation, createMutation, message, closeForm]);

  const items = bannersQuery.data ?? [];
  const products = productsQuery.data?.items ?? [];

  return (
    <ShopShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Баннеры
          </Typography.Title>
          <Typography.Text type="secondary">
            Карусель на главной приложения — всего: {items.length}
          </Typography.Text>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Обновить">
            <Button
              aria-label="Обновить баннеры"
              icon={<ReloadOutlined />}
              loading={bannersQuery.isFetching}
              onClick={handleRefresh}
              className="cursor-pointer!"
            />
          </Tooltip>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="cursor-pointer! transition-colors! duration-200!"
          >
            Новый баннер
          </Button>
        </div>
      </header>

      <If condition={Boolean(bannersQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(bannersQuery.error)}
        />
      </If>

      <If condition={!bannersQuery.isLoading && items.length === 0}>
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
          isLoading={bannersQuery.isLoading}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
        />
      </section>

      <BannerForm
        open={formOpen}
        editing={editing}
        categories={categoriesQuery.data ?? []}
        products={products}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </ShopShell>
  );
};
