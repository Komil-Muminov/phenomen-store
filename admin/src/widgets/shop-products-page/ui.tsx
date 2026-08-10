import { useCallback, useState } from 'react';
import { Alert, App as AntApp } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useListQuery } from '@/shared/hooks';
import { buildListKey, buildListParams, parseVisibility } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ProductsTable } from '@/features/products-table';
import { ProductForm, IProductPayload } from '@/features/product-form';
import { ProductImport, IImportRow, IImportResult } from '@/features/product-import';
import { ShopShell } from '@/widgets/shop-shell';
import { useProductMutations } from '@/widgets/shop-products-page/lib';
import { RenderToolbar } from '@/widgets/shop-products-page/ui/renderToolbar';
import type {
  IShopAttribute,
  IShopCategory,
  IShopProduct,
  IShopProductList,
} from '@/entities/shop';

export const ShopProductsPage = () => {
  const { message } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopProduct | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<IImportResult | null>(null);

  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    categoryId: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
  });

  const productsQuery = useGetQuery<IShopProductList>(
    [QueryKeys.shopProducts, 'manage', ...buildListKey(applied)],
    ApiRoutes.shopProductsSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );
  const categoriesQuery = useGetQuery<IShopCategory[]>(
    [QueryKeys.shopCategories],
    ApiRoutes.shopCategoriesSearch,
    { scope: 'shop' },
  );
  const attributesQuery = useGetQuery<IShopAttribute[]>(
    [QueryKeys.shopAttributes],
    ApiRoutes.shopAttributesSearch,
    { scope: 'shop', staleTime: StaleTimeMs.long },
  );

  const mutations = useProductMutations();

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
    mutations.toggle.mutate({ id: product.id, isActive: !product.inStock }, {
      onSuccess: () => message.success(product.inStock ? 'Товар скрыт' : 'Товар возвращён в каталог'),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.toggle, message]);

  const handleImport = useCallback((rows: IImportRow[]) => {
    setImportResult(null);

    mutations.importRows.mutate({ rows }, {
      onSuccess: (result) => {
        setImportResult(result);
        message.success(`Создано ${result.created}, обновлено ${result.updated}`);
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.importRows, message]);

  const handleDuplicate = useCallback((product: IShopProduct) => {
    mutations.duplicate.mutate({ id: product.id }, {
      onSuccess: (created) => message.success(`Создана копия: ${created.name}`),
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.duplicate, message]);

  const handleSubmit = useCallback((values: IProductPayload) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (editing) {
      mutations.update.mutate({ ...values, id: editing.id }, {
        onSuccess: () => {
          message.success('Товар обновлён');
          closeForm();
        },
        onError,
      });

      return;
    }

    mutations.create.mutate(values, {
      onSuccess: () => {
        message.success('Товар создан');
        closeForm();
      },
      onError,
    });
  }, [editing, mutations.update, mutations.create, message, closeForm]);

  const handleImportOpen = useCallback(() => setImportOpen(true), []);

  const handleCategory = useCallback((categoryId: string | undefined) => {
    setFilter({ categoryId });
  }, [setFilter]);

  const handleVisibility = useCallback((value: string) => {
    setFilter({ isActive: parseVisibility(value) });
  }, [setFilter]);

  const total = productsQuery.data?.total ?? 0;

  return (
    <ShopShell>
      <RenderToolbar
        total={total}
        search={draft.search}
        categoryId={draft.categoryId}
        isActive={draft.isActive}
        categories={categoriesQuery.data ?? []}
        isFetching={productsQuery.isFetching}
        onSearch={setSearch}
        onCategory={handleCategory}
        onVisibility={handleVisibility}
        onRefresh={handleRefresh}
        onImport={handleImportOpen}
        onCreate={handleCreate}
      />

      <If condition={Boolean(productsQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(productsQuery.error)}
        />
      </If>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden p-0">
        <ProductsTable
          items={productsQuery.data?.items ?? []}
          isLoading={productsQuery.isLoading}
          onEdit={handleEdit}
          onToggle={handleToggle}
          onDuplicate={handleDuplicate}
        />
      </section>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />

      <ProductForm
        open={formOpen}
        editing={editing}
        categories={categoriesQuery.data ?? []}
        attributes={attributesQuery.data ?? []}
        isSaving={mutations.create.isPending || mutations.update.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />

      <ProductImport
        open={importOpen}
        isSaving={mutations.importRows.isPending}
        result={importResult}
        onSubmit={handleImport}
        onCancel={() => {
          setImportOpen(false);
          setImportResult(null);
        }}
      />
    </ShopShell>
  );
};
