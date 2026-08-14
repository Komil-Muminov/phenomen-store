import { Button, Empty, Input, Skeleton, Tag, Typography } from 'antd';
import { resolveMediaUrl } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import {
  IInvoice,
  InvoiceStatus,
  InvoiceStatusColors,
  InvoiceStatusLabels,
  formatInvoiceAmount,
  formatInvoiceMoment,
} from '@/entities/invoice';
import { InvoicesTableTexts } from '@/features/invoices-table/model';

interface IProps {
  items: IInvoice[];
  isLoading: boolean;
  activeId: string | null;
  note: string;
  isSaving: boolean;
  planLabels: Record<string, string>;
  onNote: (value: string) => void;
  onOpen: (invoice: IInvoice) => void;
  onReview: (accepted: boolean) => void;
  onCancel: (invoice: IInvoice) => void;
}

export const InvoicesTable = ({
  items,
  isLoading,
  activeId,
  note,
  isSaving,
  planLabels,
  onNote,
  onOpen,
  onReview,
  onCancel,
}: IProps) => (
  <div className="flex flex-col gap-3">
    <If condition={!isLoading} fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
      <If condition={items.length > 0} fallback={<Empty description={InvoicesTableTexts.empty} />}>
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Typography.Text strong className="block text-slate-900!">
                  {`Счёт ${item.number} · ${item.tenantName}`}
                </Typography.Text>
                <Typography.Text className="text-xs! text-slate-500!">
                  {`${InvoicesTableTexts.plan}: ${planLabels[item.plan] ?? item.plan} · ${InvoicesTableTexts.period}: ${item.period}`}
                </Typography.Text>
              </div>
              <span className="flex items-center gap-2">
                <Typography.Text strong className="text-slate-900!">
                  {formatInvoiceAmount(item)}
                </Typography.Text>
                <Tag color={InvoiceStatusColors[item.status]} className="m-0!">
                  {InvoiceStatusLabels[item.status] ?? item.status}
                </Tag>
              </span>
            </header>

            <Typography.Text className="text-xs! text-slate-400!">
              {`${InvoicesTableTexts.issued}: ${item.issuedBy} · ${formatInvoiceMoment(item.createdAt)}${item.dueDate ? ` · ${InvoicesTableTexts.due} ${item.dueDate}` : ''}`}
            </Typography.Text>

            <If condition={Boolean(item.comment)}>
              <Typography.Text className="text-sm! text-slate-600!">{item.comment}</Typography.Text>
            </If>

            <If
              condition={Boolean(item.receiptUrl)}
              fallback={(
                <Typography.Text className="text-xs! text-slate-400!">
                  {InvoicesTableTexts.noReceipt}
                </Typography.Text>
              )}
            >
              <a href={resolveMediaUrl(item.receiptUrl)} target="_blank" rel="noreferrer">
                <img
                  src={resolveMediaUrl(item.receiptUrl)}
                  alt={InvoicesTableTexts.receipt}
                  className="max-h-64 rounded-xl border border-slate-200 object-contain"
                />
              </a>
              <If condition={Boolean(item.receiptNote)}>
                <Typography.Text className="text-xs! text-slate-500!">
                  {`${InvoicesTableTexts.receiptNote}: ${item.receiptNote}`}
                </Typography.Text>
              </If>
            </If>

            <If condition={Boolean(item.reviewedAt)}>
              <Typography.Text className="text-xs! text-slate-500!">
                {`${InvoicesTableTexts.reviewed}: ${item.reviewedBy ?? ''} · ${formatInvoiceMoment(item.reviewedAt ?? '')}${item.reviewNote ? ` · ${item.reviewNote}` : ''}`}
              </Typography.Text>
            </If>

            <If
              condition={item.id === activeId}
              fallback={(
                <span className="flex flex-wrap gap-2">
                  <If condition={Boolean(item.receiptUrl) && item.status !== InvoiceStatus.paid}>
                    <Button size="small" onClick={() => onOpen(item)} className="cursor-pointer!">
                      {InvoicesTableTexts.accept}
                    </Button>
                  </If>
                  <If condition={item.status === InvoiceStatus.pending}>
                    <Button
                      size="small"
                      danger
                      onClick={() => onCancel(item)}
                      className="cursor-pointer!"
                    >
                      {InvoicesTableTexts.cancel}
                    </Button>
                  </If>
                </span>
              )}
            >
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Input.TextArea
                  value={note}
                  onChange={(event) => onNote(event.target.value)}
                  placeholder={InvoicesTableTexts.rejectPlaceholder}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
                <span className="flex gap-2 self-end">
                  <Button
                    type="primary"
                    size="small"
                    loading={isSaving}
                    onClick={() => onReview(true)}
                    className="cursor-pointer!"
                  >
                    {InvoicesTableTexts.accept}
                  </Button>
                  <Button
                    danger
                    size="small"
                    loading={isSaving}
                    onClick={() => onReview(false)}
                    className="cursor-pointer!"
                  >
                    {InvoicesTableTexts.reject}
                  </Button>
                </span>
              </div>
            </If>
          </article>
        ))}
      </If>
    </If>
  </div>
);
