import { Button, Empty, Input, Skeleton, Tag, Typography, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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
import { ShopInvoicesTexts } from '@/widgets/shop-invoices-page/model';

interface IProps {
  items: IInvoice[];
  isLoading: boolean;
  activeId: string | null;
  receiptUrl: string;
  note: string;
  isUploading: boolean;
  isSending: boolean;
  planLabels: Record<string, string>;
  onOpen: (invoice: IInvoice) => void;
  onNote: (value: string) => void;
  onUpload: (file: File) => void;
  onSend: () => void;
}

export const RenderList = ({
  items,
  isLoading,
  activeId,
  receiptUrl,
  note,
  isUploading,
  isSending,
  planLabels,
  onOpen,
  onNote,
  onUpload,
  onSend,
}: IProps) => (
  <div className="flex flex-col gap-3">
    <If condition={!isLoading} fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
      <If condition={items.length > 0} fallback={<Empty description="Счетов пока нет" />}>
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Typography.Text strong className="block text-slate-900!">
                  {`Счёт ${item.number} · ${item.period}`}
                </Typography.Text>
                <Typography.Text className="text-xs! text-slate-500!">
                  {`Тариф: ${planLabels[item.plan] ?? item.plan}${item.dueDate ? ` · оплатить до ${item.dueDate}` : ''}`}
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

            <If condition={Boolean(item.comment)}>
              <Typography.Text className="text-sm! text-slate-600!">{item.comment}</Typography.Text>
            </If>

            <If condition={Boolean(item.receiptUrl)}>
              <a href={resolveMediaUrl(item.receiptUrl)} target="_blank" rel="noreferrer">
                <img
                  src={resolveMediaUrl(item.receiptUrl)}
                  alt={ShopInvoicesTexts.attach}
                  className="max-h-52 rounded-xl border border-slate-200 object-contain"
                />
              </a>
            </If>

            <If condition={Boolean(item.reviewNote)}>
              <Typography.Text className="text-xs! text-rose-500!">
                {item.reviewNote}
              </Typography.Text>
            </If>

            <Typography.Text className="text-xs! text-slate-400!">
              {formatInvoiceMoment(item.createdAt)}
            </Typography.Text>

            <If
              condition={item.id === activeId}
              fallback={(
                <If
                  condition={item.status !== InvoiceStatus.paid
                    && item.status !== InvoiceStatus.cancelled}
                >
                  <Button size="small" onClick={() => onOpen(item)} className="cursor-pointer! self-start">
                    {item.receiptUrl ? ShopInvoicesTexts.replace : ShopInvoicesTexts.attach}
                  </Button>
                </If>
              )}
            >
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    onUpload(file as unknown as File);

                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={isUploading} className="cursor-pointer!">
                    {receiptUrl ? ShopInvoicesTexts.replace : ShopInvoicesTexts.attach}
                  </Button>
                </Upload>

                <Input.TextArea
                  value={note}
                  onChange={(event) => onNote(event.target.value)}
                  placeholder={ShopInvoicesTexts.notePlaceholder}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />

                <Button
                  type="primary"
                  size="small"
                  loading={isSending}
                  disabled={!receiptUrl}
                  onClick={onSend}
                  className="cursor-pointer! self-end"
                >
                  {ShopInvoicesTexts.send}
                </Button>
              </div>
            </If>
          </article>
        ))}
      </If>
    </If>
  </div>
);
