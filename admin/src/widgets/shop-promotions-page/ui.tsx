import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, UiMessages, VisibilityOptions } from '@/shared/config';
import { useGetQuery, useListQuery } from '@/shared/hooks';
import { buildListKey, buildListParams, formatVisibility, parseVisibility } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import { IPromotion, IPromotionList, PromotionTexts, PromotionsTable } from '@/features/promotions-table';
import { IPromotionFormValues, PromotionForm } from '@/features/promotion-form';
import { usePromotionMutations } from '@/widgets/shop-promotions-page/lib';

export const ShopPromotionsPage = () => {
  const { message, modal } = AntApp.useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IPromotion | null>(null);

  const { draft, applied, setFilter, setSearch, setPage } = useListQuery({
    isActive: undefined as boolean | undefined,
  });

  const promotionsQuery = useGetQuery<IPromotionList>(
    [QueryKeys.shopPromotions, ...buildListKey(applied)],
    ApiRoutes.shopPromotionsSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const mutations = usePromotionMutations();

  const showError = useCallback((error: Error) => {
    message.error(extractErrorMessage(error));
  }, [message]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((promotion: IPromotion) => {
    setEditing(promotion);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback((values: IPromotionFormValues) => {
    const onSuccess = (text: string) => () => {
      message.success(text);
      closeForm();
    };

    if (editing) {
      mutations.update.mutate({ ...values, id: editing.id }, {
        onSuccess: onSuccess(PromotionTexts.updated),
        onError: showError,
      });

      return;
    }

    mutations.create.mutate(values, {
      onSuccess: onSuccess(PromotionTexts.created),
      onError: showError,
    });
  }, [editing, mutations.create, mutations.update, message, closeForm, showError]);

  const handleDelete = useCallback((promotion: IPromotion) => {
    modal.confirm({
      title: PromotionTexts.deleteTitle,
      content: `«${promotion.name}». ${PromotionTexts.deleteHint}`,
      okText: 'Удалить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: () => new Promise<void>((resolve) => {
        mutations.remove.mutate({ id: promotion.id }, {
          onSuccess: () => message.success(PromotionTexts.deleted),
          onError: showError,
          onSettled: () => resolve(),
        });
      }),
    });
  }, [modal, mutations.remove, message, showError]);

  const total = promotionsQuery.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar
        title={PromotionTexts.title}
        subtitle={`${PromotionTexts.subtitle} — найдено: ${total}`}
        search={draft.search}
        searchPlaceholder={PromotionTexts.searchPlaceholder}
        isFetching={promotionsQuery.isFetching}
        onSearch={setSearch}
        onRefresh={() => promotionsQuery.refetch()}
        filters={(
          <Select
            value={formatVisibility(draft.isActive)}
            onChange={(value) => setFilter({ isActive: parseVisibility(value) })}
            options={VisibilityOptions}
            className="w-40"
          />
        )}
        actions={(
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="cursor-pointer!">
            {PromotionTexts.create}
          </Button>
        )}
      />

      <If condition={!promotionsQuery.isError} fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}>
        <PromotionsTable
          items={promotionsQuery.data?.items ?? []}
          isLoading={promotionsQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </If>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />

      <PromotionForm
        open={formOpen}
        editing={editing}
        isSaving={mutations.create.isPending || mutations.update.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    </section>
  );
};
