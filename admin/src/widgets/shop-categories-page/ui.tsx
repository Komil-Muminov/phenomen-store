import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { CategoriesTable } from '@/features/categories-table';
import { CategoryForm, ICategoryFormValues } from '@/features/category-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { IShopCategory } from '@/entities/shop';

export const ShopCategoriesPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopCategory | null>(null);

  const categoriesQuery = useGetQuery<IShopCategory[]>(
    [QueryKeys.shopCategories, 'manage'],
    ApiRoutes.shopCategoriesManage,
    { scope: 'shop' },
  );

  const invalidate = [[QueryKeys.shopCategories]];
  const createMutation = useMutationQuery<ICategoryFormValues, IShopCategory>(
    ApiRoutes.shopCategoryCreate,
    { scope: 'shop', invalidate },
  );
  const updateMutation = useMutationQuery<ICategoryFormValues & { id: string }, IShopCategory>(
    (body) => `${ApiRoutes.shopCategoryUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate },
  );
  const deactivateMutation = useMutationQuery<{ id: string }, IShopCategory>(
    (body) => `${ApiRoutes.shopCategoryDeactivate}/${body.id}`,
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

  const handleEdit = useCallback((category: IShopCategory) => {
    setEditing(category);
    setFormOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopCategories] });
  }, [queryClient]);

  const handleDeactivate = useCallback((category: IShopCategory) => {
    deactivateMutation.mutate({ id: category.id }, {
      onSuccess: () => message.success('Категория скрыта'),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [deactivateMutation, message]);

  const handleSubmit = useCallback((values: ICategoryFormValues) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (editing) {
      updateMutation.mutate({ ...values, id: editing.id }, {
        onSuccess: () => {
          message.success('Категория обновлена');
          closeForm();
        },
        onError,
      });

      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        message.success('Категория создана');
        closeForm();
      },
      onError,
    });
  }, [editing, updateMutation, createMutation, message, closeForm]);

  const items = categoriesQuery.data ?? [];

  return (
    <ShopShell>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Категории
          </Typography.Title>
          <Typography.Text type="secondary">Всего: {items.length}</Typography.Text>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Обновить">
            <Button
              aria-label="Обновить категории"
              icon={<ReloadOutlined />}
              loading={categoriesQuery.isFetching}
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
            Новая категория
          </Button>
        </div>
      </header>

      <If condition={Boolean(categoriesQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(categoriesQuery.error)}
        />
      </If>

      <If condition={!categoriesQuery.isLoading && items.length === 0}>
        <Alert
          type="warning"
          showIcon
          className="mb-4!"
          message="В магазине нет категорий"
          description="Пока их нет, товары попадут в каталог без раздела. Создайте хотя бы одну."
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <CategoriesTable
          items={items}
          isLoading={categoriesQuery.isLoading}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
        />
      </section>

      <CategoryForm
        open={formOpen}
        editing={editing}
        categories={items}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </ShopShell>
  );
};
