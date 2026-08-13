import { useCallback, useEffect, useState } from 'react';
import { Alert, App as AntApp, Select, Space } from 'antd';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, UiMessages } from '@/shared/config';
import { useGetQuery, useListQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import {
  ITicketList,
  ITicketThread,
  TicketAuthors,
  TicketStatusOptions,
  TicketTopicOptions,
  formatTicketFilter,
  parseTicketFilter,
} from '@/entities/ticket';
import { TicketThread } from '@/features/ticket-thread';
import { TicketsList } from '@/features/tickets-list';
import { usePlatformTicketMutations } from '@/widgets/platform-tickets-page/lib';
import { PlatformTicketsTexts } from '@/widgets/platform-tickets-page/model';

const TOPIC_OPTIONS = [
  { value: 'all', label: PlatformTicketsTexts.allTopics },
  ...TicketTopicOptions,
];

export const PlatformTicketsPage = () => {
  const { message } = AntApp.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const { draft: filters, applied, setFilter, setSearch, setPage } = useListQuery({
    status: undefined as string | undefined,
    topic: undefined as string | undefined,
  });

  const listQuery = useGetQuery<ITicketList>(
    [QueryKeys.platformTickets, ...buildListKey(applied)],
    ApiRoutes.platformTicketsSearch,
    { params: buildListParams(applied, ListLimits.default) },
  );

  const threadQuery = useGetQuery<ITicketThread>(
    [QueryKeys.platformTickets, 'thread', activeId],
    `${ApiRoutes.platformTicketGet}/${activeId}`,
    { enabled: Boolean(activeId) },
  );

  const mutations = usePlatformTicketMutations();

  const showError = useCallback((error: Error) => {
    message.error(extractErrorMessage(error));
  }, [message]);

  const handleSend = useCallback(() => {
    if (!activeId) {
      return;
    }

    mutations.reply.mutate({ id: activeId, text: draft.trim() }, {
      onSuccess: () => {
        message.success(PlatformTicketsTexts.sent);
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
        message.success(PlatformTicketsTexts.closed);
        threadQuery.refetch();
      },
      onError: showError,
    });
  }, [activeId, mutations.close, message, showError, threadQuery]);

  const openedId = threadQuery.data?.ticket.id ?? null;

  useEffect(() => {
    if (openedId) {
      listQuery.refetch();
    }
  }, [openedId]);

  const total = listQuery.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar
        title={PlatformTicketsTexts.title}
        subtitle={`${PlatformTicketsTexts.subtitle} — найдено: ${total}`}
        search={filters.search}
        searchPlaceholder={PlatformTicketsTexts.searchPlaceholder}
        isFetching={listQuery.isFetching}
        onSearch={setSearch}
        onRefresh={() => listQuery.refetch()}
        filters={(
          <Space wrap>
            <Select
              value={formatTicketFilter(filters.status)}
              onChange={(value) => setFilter({ status: parseTicketFilter(value) })}
              options={TicketStatusOptions}
              className="w-40"
            />
            <Select
              value={formatTicketFilter(filters.topic)}
              onChange={(value) => setFilter({ topic: parseTicketFilter(value) })}
              options={TOPIC_OPTIONS}
              className="w-48"
            />
          </Space>
        )}
      />

      <If condition={!listQuery.isError} fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
          <TicketsList
            items={listQuery.data?.items ?? []}
            isLoading={listQuery.isLoading}
            activeId={activeId}
            isPlatform
            onSelect={(id) => {
              setActiveId(id);
              setDraft('');
            }}
          />

          <TicketThread
            thread={threadQuery.data ?? null}
            side={TicketAuthors.platform}
            draft={draft}
            isSending={mutations.reply.isPending}
            isClosing={mutations.close.isPending}
            canClose
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
