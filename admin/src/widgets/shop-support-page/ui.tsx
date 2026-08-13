import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Select } from 'antd';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, UiMessages } from '@/shared/config';
import { useGetQuery, useListQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import { useSupportMutations } from '@/widgets/shop-support-page/lib';
import {
  IConversationList,
  IThread,
  StatusOptions,
  SupportTexts,
  formatStatus,
  parseStatus,
} from '@/widgets/shop-support-page/model';
import { RenderList } from '@/widgets/shop-support-page/ui/renderList';
import { RenderThread } from '@/widgets/shop-support-page/ui/renderThread';

export const ShopSupportPage = () => {
  const { message } = AntApp.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const { draft: filters, applied, setFilter, setSearch, setPage } = useListQuery({
    status: undefined as string | undefined,
  });

  const listQuery = useGetQuery<IConversationList>(
    [QueryKeys.shopSupport, ...buildListKey(applied)],
    ApiRoutes.shopSupportSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const threadQuery = useGetQuery<IThread>(
    [QueryKeys.shopSupport, 'thread', activeId],
    `${ApiRoutes.shopSupportGet}/${activeId}`,
    { scope: 'shop', enabled: Boolean(activeId) },
  );

  const mutations = useSupportMutations();

  const showError = useCallback((error: Error) => {
    message.error(extractErrorMessage(error));
  }, [message]);

  const handleSend = useCallback(() => {
    if (!activeId) {
      return;
    }

    mutations.reply.mutate({ id: activeId, text: draft.trim() }, {
      onSuccess: () => {
        message.success(SupportTexts.sent);
        setDraft('');
        threadQuery.refetch();
      },
      onError: showError,
    });
  }, [activeId, draft, mutations.reply, message, showError, threadQuery]);

  const handleClose = useCallback(() => {
    if (!activeId) {
      return;
    }

    mutations.close.mutate({ id: activeId }, {
      onSuccess: () => {
        message.success(SupportTexts.closed);
        threadQuery.refetch();
      },
      onError: showError,
    });
  }, [activeId, mutations.close, message, showError, threadQuery]);

  const total = listQuery.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar
        title={SupportTexts.title}
        subtitle={`${SupportTexts.subtitle} — найдено: ${total}`}
        search={filters.search}
        searchPlaceholder={SupportTexts.searchPlaceholder}
        isFetching={listQuery.isFetching}
        onSearch={setSearch}
        onRefresh={() => listQuery.refetch()}
        filters={(
          <Select
            value={formatStatus(filters.status)}
            onChange={(value) => setFilter({ status: parseStatus(value) })}
            options={StatusOptions}
            className="w-40"
          />
        )}
      />

      <If condition={!listQuery.isError} fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <RenderList
            items={listQuery.data?.items ?? []}
            isLoading={listQuery.isLoading}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setDraft('');
            }}
          />

          <RenderThread
            thread={threadQuery.data ?? null}
            draft={draft}
            isSending={mutations.reply.isPending}
            isClosing={mutations.close.isPending}
            onDraft={setDraft}
            onSend={handleSend}
            onClose={handleClose}
          />
        </div>
      </If>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />
    </section>
  );
};
