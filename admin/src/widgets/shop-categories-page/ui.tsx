import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, VisibilityOptions } from '@/shared/config';
import { useGetQuery, useListQuery, useMutationQuery } from '@/shared/hooks';
import {
  buildListKey,
  buildListParams,
  formatVisibility,
  parseVisibility,
} from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import { CategoriesTable } from '@/features/categories-table';
import { CategoryForm, ICategoryFormValues } from '@/features/category-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { IShopCategory, IShopCategoryList } from '@/entities/shop';

export const ShopCategoriesPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopCategory | null>(null);

  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    isActive: undefined as boolean | undefined,
  });

  const categoriesQuery = useGetQuery<IShopCategoryList>(
    [QueryKeys.shopCategories, 'manage', ...buildListKey(applied)],
    ApiRoutes.shopCategoriesManage,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );
  const parentsQuery = useGetQuery<IShopCategory[]>(
    [QueryKeys.shopCategories, 'parents'],
    ApiRoutes.shopCategoriesSearch,
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

  const handleVisibility = useCallback((value: string) => {
    setFilter({ isActive: parseVisibility(value) });
  }, [setFilter]);

  const items = categoriesQuery.data?.items ?? [];
  const total = categoriesQuery.data?.total ?? 0;

  return (
    <ShopShell>
      <ListToolbar
        title="Категории"
        subtitle={`Найдено: ${total}`}
        search={draft.search}
        searchPlaceholder="Название или слаг"
        isFetching={categoriesQuery.isFetching}
        onSearch={setSearch}
        onRefresh={handleRefresh}
        filters={(
          <Select
            value={formatVisibility(draft.isActive)}
            onChange={handleVisibility}
            className="min-w-40"
            options={VisibilityOptions}
          />
        )}
        actions={(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="cursor-pointer! transition-colors! duration-200!"
          >
            Новая категория
          </Button>
        )}
      />

      <If condition={Boolean(categoriesQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(categoriesQuery.error)}
        />
      </If>

      <If condition={!categoriesQuery.isLoading && total === 0 && !applied.search}>
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

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />

      <CategoryForm
        open={formOpen}
        editing={editing}
        categories={parentsQuery.data ?? []}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </ShopShell>
  );
};
