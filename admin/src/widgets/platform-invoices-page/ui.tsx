import { useCallback, useMemo, useState } from 'react';
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
  IInvoice,
  IInvoiceList,
  InvoiceStatusOptions,
  formatInvoiceFilter,
  parseInvoiceFilter,
} from '@/entities/invoice';
import { PlanLabels } from '@/entities/plan';
import type { ITenantList } from '@/entities/tenant';
import { InvoiceForm, type IInvoiceValues } from '@/features/invoice-form';
import { InvoicesTable } from '@/features/invoices-table';
import { useInvoiceMutations } from '@/widgets/platform-invoices-page/lib';
import {
  IBillingSettings,
  IMailStatus,
  IBlockedList,
  IBlockedTenant,
  IPlatformSettings,
  PlatformInvoicesTexts,
} from '@/widgets/platform-invoices-page/model';
import { RenderBilling } from '@/widgets/platform-invoices-page/ui/renderBilling';
import { RenderCard } from '@/widgets/platform-invoices-page/ui/renderCard';
import { RenderMail } from '@/widgets/platform-invoices-page/ui/renderMail';

export const PlatformInvoicesPage = () => {
  const { message } = AntApp.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [releasingKey, setReleasingKey] = useState<string | null>(null);

  const { draft: filters, applied, setFilter, setSearch, setPage } = useListQuery({
    status: undefined as string | undefined,
  });

  const listQuery = useGetQuery<IInvoiceList>(
    [QueryKeys.platformInvoices, ...buildListKey(applied)],
    ApiRoutes.platformInvoicesSearch,
    { params: buildListParams(applied, ListLimits.default) },
  );

  const settingsQuery = useGetQuery<IPlatformSettings>(
    [QueryKeys.platformCard],
    ApiRoutes.platformInvoiceSettings,
  );

  const tenantsQuery = useGetQuery<ITenantList>(
    [QueryKeys.tenants, 'invoice-options'],
    ApiRoutes.tenantsSearch,
    { params: { page: 1, limit: 100 } },
  );

  const billingQuery = useGetQuery<IBillingSettings>(
    [QueryKeys.platformBilling],
    ApiRoutes.platformBillingSettings,
  );

  const blockedQuery = useGetQuery<IBlockedList>(
    [QueryKeys.platformBlocked],
    ApiRoutes.platformBillingBlocked,
  );

  const mailQuery = useGetQuery<IMailStatus>(
    [QueryKeys.platformMail],
    ApiRoutes.platformMailStatus,
  );

  const mutations = useInvoiceMutations();

  const showError = useCallback((error: Error) => {
    message.error(extractErrorMessage(error));
  }, [message]);

  const tenantOptions = useMemo(
    () => (tenantsQuery.data?.items ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} (${item.key})`,
    })),
    [tenantsQuery.data?.items],
  );

  const planPrices = useMemo(
    () => (settingsQuery.data?.plans ?? []).reduce<Record<string, number>>((acc, plan) => {
      acc[plan.code] = plan.price;

      return acc;
    }, {}),
    [settingsQuery.data?.plans],
  );

  const handleCreate = useCallback((values: IInvoiceValues) => {
    mutations.create.mutate(values, {
      onSuccess: () => {
        message.success(PlatformInvoicesTexts.issued);
        setFormOpen(false);
      },
      onError: showError,
    });
  }, [mutations.create, message, showError]);

  const handleReview = useCallback((accepted: boolean) => {
    if (!activeId) {
      return;
    }

    mutations.review.mutate({ id: activeId, accepted, note: note.trim() }, {
      onSuccess: () => {
        message.success(accepted
          ? PlatformInvoicesTexts.accepted
          : PlatformInvoicesTexts.rejected);
        setActiveId(null);
        setNote('');
      },
      onError: showError,
    });
  }, [activeId, note, mutations.review, message, showError]);

  const handleCancel = useCallback((invoice: IInvoice) => {
    mutations.cancel.mutate({ id: invoice.id }, {
      onSuccess: () => message.success(PlatformInvoicesTexts.cancelled),
      onError: showError,
    });
  }, [mutations.cancel, message, showError]);

  const handleTestMail = useCallback((email: string) => {
    mutations.testMail.mutate({ email }, {
      onSuccess: () => message.success(PlatformInvoicesTexts.mailSent),
      onError: showError,
    });
  }, [mutations.testMail, message, showError]);

  const handleSaveBilling = useCallback((values: IBillingSettings) => {
    mutations.saveBilling.mutate(values, {
      onSuccess: () => {
        message.success(PlatformInvoicesTexts.billingSaved);
        blockedQuery.refetch();
      },
      onError: showError,
    });
  }, [mutations.saveBilling, message, showError, blockedQuery]);

  const handleRunCheck = useCallback(() => {
    mutations.runCheck.mutate({}, {
      onSuccess: () => message.success(PlatformInvoicesTexts.checked),
      onError: showError,
    });
  }, [mutations.runCheck, message, showError]);

  const handleRelease = useCallback((tenant: IBlockedTenant) => {
    setReleasingKey(tenant.id);
    mutations.release.mutate({ tenantId: tenant.id }, {
      onSuccess: () => message.success(PlatformInvoicesTexts.released),
      onError: showError,
      onSettled: () => setReleasingKey(null),
    });
  }, [mutations.release, message, showError]);

  const handleSaveCard = useCallback((card: IPlatformSettings['card']) => {
    mutations.saveCard.mutate(card, {
      onSuccess: () => message.success(PlatformInvoicesTexts.cardSaved),
      onError: showError,
    });
  }, [mutations.saveCard, message, showError]);

  const total = listQuery.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <RenderCard
        settings={settingsQuery.data ?? null}
        isSaving={mutations.saveCard.isPending}
        onSubmit={handleSaveCard}
      />

      <RenderMail
        status={mailQuery.data ?? null}
        isSending={mutations.testMail.isPending}
        onSend={handleTestMail}
      />

      <RenderBilling
        settings={billingQuery.data ?? null}
        blocked={blockedQuery.data?.items ?? []}
        isSaving={mutations.saveBilling.isPending}
        isRunning={mutations.runCheck.isPending}
        releasingKey={releasingKey}
        onSubmit={handleSaveBilling}
        onRun={handleRunCheck}
        onRelease={handleRelease}
      />

      <ListToolbar
        title={PlatformInvoicesTexts.title}
        subtitle={`${PlatformInvoicesTexts.subtitle} — найдено: ${total}`}
        search={filters.search}
        searchPlaceholder={PlatformInvoicesTexts.searchPlaceholder}
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
        actions={(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormOpen(true)}
            className="cursor-pointer!"
          >
            {PlatformInvoicesTexts.issue}
          </Button>
        )}
      />

      <If
        condition={!listQuery.isError}
        fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}
      >
        <InvoicesTable
          items={listQuery.data?.items ?? []}
          isLoading={listQuery.isLoading}
          activeId={activeId}
          note={note}
          isSaving={mutations.review.isPending}
          planLabels={PlanLabels}
          onNote={setNote}
          onOpen={(invoice) => {
            setActiveId(invoice.id);
            setNote('');
          }}
          onReview={handleReview}
          onCancel={handleCancel}
        />
      </If>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />

      <InvoiceForm
        isOpen={isFormOpen}
        isSaving={mutations.create.isPending}
        tenants={tenantOptions}
        planPrices={planPrices}
        onSubmit={handleCreate}
        onCancel={() => setFormOpen(false)}
      />
    </section>
  );
};
