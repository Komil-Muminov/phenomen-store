import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { ProductsTable } from '@/features/products-table';
import { ProductForm, IProductFormValues } from '@/features/product-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { IShopCategory, IShopProduct, IShopProductList } from '@/entities/shop';

export const ShopProductsPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopProduct | null>(null);

  const productsQuery = useGetQuery<IShopProductList>(
    [QueryKeys.shopProducts],
    ApiRoutes.shopProductsSearch,
    { scope: 'shop' },
  );
  const categoriesQuery = useGetQuery<IShopCategory[]>(
    [QueryKeys.shopCategories],
    ApiRoutes.shopCategoriesSearch,
    { scope: 'shop' },
  );

  const invalidate = [[QueryKeys.shopProducts]];
  const createMutation = useMutationQuery<IProductFormValues, IShopProduct>(
    ApiRoutes.shopProductCreate,
    { scope: 'shop', invalidate },
  );
  const updateMutation = useMutationQuery<IProductFormValues & { id: string }, IShopProduct>(
    (body) => `${ApiRoutes.shopProductUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate },
  );
  const toggleMutation = useMutationQuery<{ id: string; isActive: boolean }, IShopProduct>(
    (body) => `${ApiRoutes.shopProductUpdate}/${body.id}`,
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

  const handleEdit = useCallback((product: IShopProduct) => {
    setEditing(product);
    setFormOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopProducts] });
  }, [queryClient]);

  const handleToggle = useCallback((product: IShopProduct) => {
    toggleMutation.mutate({ id: product.id, isActive: !product.inStock }, {
      onSuccess: () => message.success(product.inStock ? 'Товар скрыт' : 'Товар возвращён в каталог'),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [toggleMutation, message]);

  const handleSubmit = useCallback((values: IProductFormValues) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (editing) {
      updateMutation.mutate({ ...values, id: editing.id }, {
        onSuccess: () => {
          message.success('Товар обновлён');
          closeForm();
        },
        onError,
      });

      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        message.success('Товар создан');
        closeForm();
      },
      onError,
    });
  }, [editing, updateMutation, createMutation, message, closeForm]);

  return (
    <ShopShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Товары
          </Typography.Title>
          <Typography.Text type="secondary">
            Всего: {productsQuery.data?.total ?? 0}
          </Typography.Text>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Обновить">
            <Button
              aria-label="Обновить список товаров"
              icon={<ReloadOutlined />}
              loading={productsQuery.isFetching}
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
            Новый товар
          </Button>
        </div>
      </header>

      <If condition={Boolean(productsQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(productsQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <ProductsTable
          items={productsQuery.data?.items ?? []}
          isLoading={productsQuery.isLoading}
          onEdit={handleEdit}
          onToggle={handleToggle}
        />
      </section>

      <ProductForm
        open={formOpen}
        editing={editing}
        categories={categoriesQuery.data ?? []}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </ShopShell>
  );
};
