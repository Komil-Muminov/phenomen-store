import { useCallback, useEffect, useState } from 'react';
import { Alert, App as AntApp, Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
  formatTicketFilter,
  parseTicketFilter,
} from '@/entities/ticket';
import { TicketForm, type ITicketValues } from '@/features/ticket-form';
import { TicketThread } from '@/features/ticket-thread';
import { TicketsList } from '@/features/tickets-list';
import { useShopTicketMutations } from '@/widgets/shop-tickets-page/lib';
import { ShopTicketsTexts } from '@/widgets/shop-tickets-page/model';

export const ShopTicketsPage = () => {
  const { message } = AntApp.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);

  const { draft: filters, applied, setFilter, setSearch, setPage } = useListQuery({
    status: undefined as string | undefined,
  });

  const listQuery = useGetQuery<ITicketList>(
    [QueryKeys.shopTickets, ...buildListKey(applied)],
    ApiRoutes.shopTicketsSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const threadQuery = useGetQuery<ITicketThread>(
    [QueryKeys.shopTickets, 'thread', activeId],
    `${ApiRoutes.shopTicketGet}/${activeId}`,
    { scope: 'shop', enabled: Boolean(activeId) },
  );

  const mutations = useShopTicketMutations();

  const showError = useCallback((error: Error) => {
    message.error(extractErrorMessage(error));
  }, [message]);

  const handleCreate = useCallback((values: ITicketValues) => {
    mutations.create.mutate(values, {
      onSuccess: (thread) => {
        message.success(ShopTicketsTexts.created);
        setFormOpen(false);
        setActiveId(thread.ticket.id);
      },
      onError: showError,
    });
  }, [mutations.create, message, showError]);

  const handleSend = useCallback(() => {
    if (!activeId) {
      return;
    }

    mutations.reply.mutate({ id: activeId, text: draft.trim() }, {
      onSuccess: () => {
        message.success(ShopTicketsTexts.sent);
        setDraft('');
        threadQuery.refetch();
      },
      onError: showError,
    });
  }, [activeId, draft, mutations.reply, message, showError, threadQuery]);

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
        title={ShopTicketsTexts.title}
        subtitle={`${ShopTicketsTexts.subtitle} — найдено: ${total}`}
        search={filters.search}
        searchPlaceholder={ShopTicketsTexts.searchPlaceholder}
        isFetching={listQuery.isFetching}
        onSearch={setSearch}
        onRefresh={() => listQuery.refetch()}
        filters={(
          <Select
            value={formatTicketFilter(filters.status)}
            onChange={(value) => setFilter({ status: parseTicketFilter(value) })}
            options={TicketStatusOptions}
            className="w-40"
          />
        )}
        actions={(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormOpen(true)}
            className="cursor-pointer!"
          >
            {ShopTicketsTexts.create}
          </Button>
        )}
      />

      <If condition={!listQuery.isError} fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <TicketsList
            items={listQuery.data?.items ?? []}
            isLoading={listQuery.isLoading}
            activeId={activeId}
            isPlatform={false}
            onSelect={(id) => {
              setActiveId(id);
              setDraft('');
            }}
          />

          <TicketThread
            thread={threadQuery.data ?? null}
            side={TicketAuthors.shop}
            draft={draft}
            isSending={mutations.reply.isPending}
            isClosing={false}
            canClose={false}
            onDraft={setDraft}
            onSend={handleSend}
            onClose={() => undefined}
          />
        </div>
      </If>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />

      <TicketForm
        isOpen={isFormOpen}
        isSaving={mutations.create.isPending}
        onSubmit={handleCreate}
        onCancel={() => setFormOpen(false)}
      />
    </section>
  );
};
