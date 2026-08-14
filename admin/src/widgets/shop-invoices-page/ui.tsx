import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Card, Select, Typography } from 'antd';
import { extractErrorMessage, uploadFile } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, UiMessages } from '@/shared/config';
import { useGetQuery, useListQuery, useMutationQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import {
  IInvoice,
  IInvoiceList,
  InvoiceStatusOptions,
  formatInvoiceFilter,
  parseInvoiceFilter,
} from '@/entities/invoice';
import { PlanLabels } from '@/entities/plan';
import {
  IPlatformCardResponse,
  ShopInvoicesTexts,
} from '@/widgets/shop-invoices-page/model';
import { RenderList } from '@/widgets/shop-invoices-page/ui/renderList';

export const ShopInvoicesPage = () => {
  const { message } = AntApp.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [note, setNote] = useState('');
  const [isUploading, setUploading] = useState(false);

  const { draft: filters, applied, setFilter, setSearch, setPage } = useListQuery({
    status: undefined as string | undefined,
  });

  const listQuery = useGetQuery<IInvoiceList>(
    [QueryKeys.shopInvoices, ...buildListKey(applied)],
    ApiRoutes.shopInvoicesSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const cardQuery = useGetQuery<IPlatformCardResponse>(
    [QueryKeys.platformCard],
    ApiRoutes.shopInvoiceCard,
    { scope: 'shop' },
  );

  const receiptMutation = useMutationQuery<
    { id: string; imageUrl: string; note: string },
    IInvoice
  >(
    (body) => `${ApiRoutes.shopInvoiceReceipt}/${body.id}`,
    { scope: 'shop', invalidate: [[QueryKeys.shopInvoices]] },
  );

  const handleOpen = useCallback((invoice: IInvoice) => {
    setActiveId(invoice.id);
    setReceiptUrl('');
    setNote('');
  }, []);

  const handleUpload = useCallback((file: File) => {
    setUploading(true);

    uploadFile<{ url: string }>(ApiRoutes.shopMediaUpload, file)
      .then((result) => setReceiptUrl(result.url))
      .catch((error) => message.error(extractErrorMessage(error)))
      .finally(() => setUploading(false));
  }, [message]);

  const handleSend = useCallback(() => {
    if (!activeId) {
      return;
    }

    receiptMutation.mutate({ id: activeId, imageUrl: receiptUrl, note: note.trim() }, {
      onSuccess: () => {
        message.success(ShopInvoicesTexts.sent);
        setActiveId(null);
        setReceiptUrl('');
        setNote('');
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [activeId, receiptUrl, note, receiptMutation, message]);

  const card = cardQuery.data?.card ?? null;
  const total = listQuery.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <Card title={ShopInvoicesTexts.cardTitle} className="rounded-2xl! border-slate-200!">
        <If
          condition={Boolean(card?.number)}
          fallback={<Typography.Text className="text-sm! text-slate-500!">{ShopInvoicesTexts.cardEmpty}</Typography.Text>}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Typography.Text className="text-sm! text-slate-700!">
              {`${ShopInvoicesTexts.number}: ${card?.number}`}
            </Typography.Text>
            <Typography.Text className="text-sm! text-slate-700!">
              {`${ShopInvoicesTexts.holder}: ${card?.holder}`}
            </Typography.Text>
            <Typography.Text className="text-sm! text-slate-700!">
              {`${ShopInvoicesTexts.bank}: ${card?.bank}`}
            </Typography.Text>
            <Typography.Text className="text-sm! text-slate-500!">{card?.note}</Typography.Text>
          </div>
          <Typography.Text className="mt-2 block text-xs! text-slate-500!">
            {ShopInvoicesTexts.hint}
          </Typography.Text>
        </If>
      </Card>

      <ListToolbar
        title={ShopInvoicesTexts.title}
        subtitle={`${ShopInvoicesTexts.subtitle} — найдено: ${total}`}
        search={filters.search}
        searchPlaceholder={ShopInvoicesTexts.searchPlaceholder}
        isFetching={listQuery.isFetching}
        onSearch={setSearch}
        onRefresh={() => listQuery.refetch()}
        filters={(
          <Select
            value={formatInvoiceFilter(filters.status)}
            onChange={(value) => setFilter({ status: parseInvoiceFilter(value) })}
            options={InvoiceStatusOptions}
            className="w-44"
          />
        )}
      />

      <If
        condition={!listQuery.isError}
        fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}
      >
        <RenderList
          items={listQuery.data?.items ?? []}
          isLoading={listQuery.isLoading}
          activeId={activeId}
          receiptUrl={receiptUrl}
          note={note}
          isUploading={isUploading}
          isSending={receiptMutation.isPending}
          planLabels={PlanLabels}
          onOpen={handleOpen}
          onNote={setNote}
          onUpload={handleUpload}
          onSend={handleSend}
        />
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
