import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, AttributeKindOptions, ListLimits, QueryKeys } from '@/shared/config';
import { useGetQuery, useListQuery, useMutationQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import { AttributesTable } from '@/features/attributes-table';
import { AttributeForm, IAttributeFormValues } from '@/features/attribute-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { IShopAttribute, IShopAttributeList } from '@/entities/shop';

export const ShopAttributesPage = () => {
  const { message, modal } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopAttribute | null>(null);

  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    isVariantOption: undefined as boolean | undefined,
  });

  const attributesQuery = useGetQuery<IShopAttributeList>(
    [QueryKeys.shopAttributes, 'manage', ...buildListKey(applied)],
    ApiRoutes.shopAttributesManage,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const invalidate = [[QueryKeys.shopAttributes]];
  const createMutation = useMutationQuery<IAttributeFormValues, IShopAttribute>(
    ApiRoutes.shopAttributeCreate,
    { scope: 'shop', invalidate },
  );
  const updateMutation = useMutationQuery<IAttributeFormValues & { id: string }, IShopAttribute>(
    (body) => `${ApiRoutes.shopAttributeUpdate}/${body.id}`,
    { scope: 'shop', method: 'patch', invalidate },
  );
  const deleteMutation = useMutationQuery<{ id: string }, { deleted: boolean }>(
    (body) => `${ApiRoutes.shopAttributeDelete}/${body.id}`,
    { scope: 'shop', method: 'delete', invalidate },
  );

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((attribute: IShopAttribute) => {
    setEditing(attribute);
    setFormOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.shopAttributes] });
  }, [queryClient]);

  const handleDelete = useCallback((attribute: IShopAttribute) => {
    modal.confirm({
      title: `Удалить «${attribute.name}»?`,
      content: 'Характеристика исчезнет из карточек товаров. Если она где-то заполнена, удаление будет отклонено.',
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => new Promise<void>((resolve) => {
        deleteMutation.mutate({ id: attribute.id }, {
          onSuccess: () => message.success('Характеристика удалена'),
          onError: (error) => message.error(extractErrorMessage(error)),
          onSettled: () => resolve(),
        });
      }),
    });
  }, [deleteMutation, modal, message]);

  const handleKind = useCallback((value: string) => {
    setFilter({ isVariantOption: value === 'all' ? undefined : value === 'option' });
  }, [setFilter]);

  const handleSubmit = useCallback((values: IAttributeFormValues) => {
    const onError = (error: Error) => message.error(extractErrorMessage(error));

    if (editing) {
      updateMutation.mutate({ ...values, id: editing.id }, {
        onSuccess: () => {
          message.success('Характеристика обновлена');
          closeForm();
        },
        onError,
      });

      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        message.success('Характеристика добавлена');
        closeForm();
      },
      onError,
    });
  }, [editing, updateMutation, createMutation, message, closeForm]);

  return (
    <ShopShell>
      <ListToolbar
        title="Характеристики"
        subtitle={`Найдено: ${attributesQuery.data?.total ?? 0}`}
        search={draft.search}
        searchPlaceholder="Название или код"
        isFetching={attributesQuery.isFetching}
        onSearch={setSearch}
        onRefresh={handleRefresh}
        filters={(
          <Select
            value={draft.isVariantOption === undefined ? 'all' : (draft.isVariantOption ? 'option' : 'detail')}
            onChange={handleKind}
            className="min-w-48"
            options={AttributeKindOptions}
          />
        )}
        actions={(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="cursor-pointer! transition-colors! duration-200!"
          >
            Новая характеристика
          </Button>
        )}
      />

      <Alert
        type="info"
        showIcon
        className="mb-4!"
        message="Отсюда управляется то, какие поля видит продавец в карточке товара"
        description="Значения накапливаются автоматически при заполнении товаров. Здесь их можно почистить от опечаток и лишнего."
      />

      <If condition={Boolean(attributesQuery.error)}>
        <Alert
          type="error"
          showIcon
          className="mb-4!"
          message={extractErrorMessage(attributesQuery.error)}
        />
      </If>

      <section className="rounded-xl border border-violet-200 bg-white p-2 shadow-sm">
        <AttributesTable
          items={attributesQuery.data?.items ?? []}
          isLoading={attributesQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={attributesQuery.data?.total ?? 0}
        onChange={setPage}
      />

      <AttributeForm
        open={formOpen}
        editing={editing}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </ShopShell>
  );
};
