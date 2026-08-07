import { useCallback, useMemo, useState } from 'react';
import { Alert, App as AntApp, Button, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { If } from '@/shared/ui/If';
import { Tooltip } from '@/shared/ui/Tooltip';
import { AttributesTable } from '@/features/attributes-table';
import { AttributeForm, IAttributeFormValues } from '@/features/attribute-form';
import { ShopShell } from '@/widgets/shop-shell';
import type { IShopAttribute } from '@/entities/shop';

export const ShopAttributesPage = () => {
  const { message, modal } = AntApp.useApp();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IShopAttribute | null>(null);

  const attributesQuery = useGetQuery<IShopAttribute[]>(
    [QueryKeys.shopAttributes],
    ApiRoutes.shopAttributesSearch,
    { scope: 'shop' },
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

  const counters = useMemo(() => {
    const items = attributesQuery.data ?? [];

    return {
      options: items.filter((item) => item.isVariantOption).length,
      details: items.filter((item) => !item.isVariantOption).length,
    };
  }, [attributesQuery.data]);

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
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Typography.Title level={3} className="mb-0! text-brand-text!">
            Характеристики
          </Typography.Title>
          <Typography.Text type="secondary">
            Для вариантов: {counters.options} · описательных: {counters.details}
          </Typography.Text>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Обновить">
            <Button
              aria-label="Обновить справочник"
              icon={<ReloadOutlined />}
              loading={attributesQuery.isFetching}
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
            Новая характеристика
          </Button>
        </div>
      </header>

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
          items={attributesQuery.data ?? []}
          isLoading={attributesQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

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
