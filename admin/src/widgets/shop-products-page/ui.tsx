import { useCallback, useState } from 'react';
import { Alert, App as AntApp } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage, requestData } from '@/shared/api';
import { buildCsv, IExportRow } from '@contracts/csv';
import { downloadCsv } from '@/shared/lib';
import { ApiRoutes, ListLimits, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery, useListQuery } from '@/shared/hooks';
import { buildListKey, buildListParams, parseVisibility } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ProductsTable } from '@/features/products-table';
import { ProductForm, IProductPayload } from '@/features/product-form';
import { ProductImport, IImportRow, IImportResult } from '@/features/product-import';
import type { IAttributePayload } from '@/features/attribute-value-picker';
import type { ICategoryPayload } from '@/features/category-picker';
import { useProductMutations } from '@/widgets/shop-products-page/lib';
import { RenderToolbar } from '@/widgets/shop-products-page/ui/renderToolbar';
import { RenderBulk } from '@/widgets/shop-products-page/ui/renderBulk';
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
  const [selected, setSelected] = useState<string[]>([]);
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

  const handleBulkVisibility = useCallback((isActive: boolean) => {
    mutations.bulk.mutate({ ids: selected, isActive }, {
      onSuccess: (result) => {
        message.success(`Изменено товаров: ${result.changed}`);
        setSelected([]);
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.bulk, selected, message]);

  const handleBulkCategory = useCallback((categoryId: string) => {
    mutations.bulk.mutate({ ids: selected, categoryId }, {
      onSuccess: (result) => {
        message.success(`Перенесено товаров: ${result.changed}`);
        setSelected([]);
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [mutations.bulk, selected, message]);

  const handleExport = useCallback(async () => {
    try {
      const data = await requestData<{ rows: IExportRow[] }>(
        { url: ApiRoutes.shopProductsExport, method: 'get' },
        'shop',
      );

      downloadCsv(buildCsv(data.rows), 'products');
      message.success(`Выгружено товаров: ${data.rows.length}`);
    } catch (error) {
      message.error(extractErrorMessage(error));
    }
  }, [message]);

  const handleToggle = useCallback((product: IShopProduct) => {
    mutations.toggle.mutate({ id: product.id, isActive: !product.isActive }, {
      onSuccess: () => message.success(product.isActive ? 'Товар скрыт' : 'Товар возвращён в каталог'),
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

  const runCategoryAction = useCallback(
    (action: Promise<unknown>, success: string) => action
      .then(() => message.success(success))
      .catch((error: Error) => {
        message.error(extractErrorMessage(error));

        throw error;
      })
      .then(() => undefined),
    [message],
  );

  const handleCreateCategory = useCallback((payload: ICategoryPayload) => runCategoryAction(
    mutations.createCategory.mutateAsync(payload),
    'Категория создана',
  ), [mutations.createCategory, runCategoryAction]);

  const handleUpdateCategory = useCallback(
    (id: string, payload: ICategoryPayload) => runCategoryAction(
      mutations.renameCategory.mutateAsync({ ...payload, id }),
      'Категория обновлена',
    ),
    [mutations.renameCategory, runCategoryAction],
  );

  const handleDeleteCategory = useCallback((id: string) => runCategoryAction(
    mutations.removeCategory.mutateAsync({ id }),
    'Категория удалена',
  ), [mutations.removeCategory, runCategoryAction]);

  const handleCreateAttribute = useCallback((payload: IAttributePayload) => runCategoryAction(
    mutations.createAttribute.mutateAsync(payload),
    'Характеристика добавлена',
  ), [mutations.createAttribute, runCategoryAction]);

  const handleUpdateAttribute = useCallback(
    (id: string, payload: IAttributePayload) => runCategoryAction(
      mutations.updateAttribute.mutateAsync({ ...payload, id }),
      'Характеристика обновлена',
    ),
    [mutations.updateAttribute, runCategoryAction],
  );

  const handleDeleteAttribute = useCallback((id: string) => runCategoryAction(
    mutations.removeAttribute.mutateAsync({ id }),
    'Характеристика удалена',
  ), [mutations.removeAttribute, runCategoryAction]);

  const handleSaveValues = useCallback((id: string, values: string[]) => runCategoryAction(
    mutations.updateAttribute.mutateAsync({ id, values }),
    'Значения обновлены',
  ), [mutations.updateAttribute, runCategoryAction]);

  const handleImportOpen = useCallback(() => setImportOpen(true), []);

  const handleCategory = useCallback((categoryId: string | undefined) => {
    setFilter({ categoryId });
  }, [setFilter]);

  const handleVisibility = useCallback((value: string) => {
    setFilter({ isActive: parseVisibility(value) });
  }, [setFilter]);

  const total = productsQuery.data?.total ?? 0;

  return (
    <>
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
        onExport={handleExport}
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
        <RenderBulk
          count={selected.length}
          categories={categoriesQuery.data ?? []}
          isSaving={mutations.bulk.isPending}
          onVisibility={handleBulkVisibility}
          onCategory={handleBulkCategory}
          onReset={() => setSelected([])}
        />

        <ProductsTable
          selected={selected}
          onSelect={setSelected}
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
        isCategoryBusy={
          mutations.createCategory.isPending
          || mutations.renameCategory.isPending
          || mutations.removeCategory.isPending
        }
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        isAttributeBusy={
          mutations.createAttribute.isPending
          || mutations.updateAttribute.isPending
          || mutations.removeAttribute.isPending
        }
        onCreateAttribute={handleCreateAttribute}
        onUpdateAttribute={handleUpdateAttribute}
        onDeleteAttribute={handleDeleteAttribute}
        onSaveValues={handleSaveValues}
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
    </>
  );
};
