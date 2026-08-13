import { Button, Empty, Input, Tag, Typography } from 'antd';
import { resolveMediaUrl } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import type { IOrderPayment } from '@/entities/shop';
import {
  OrderDrawerTexts,
  PaymentStates,
  PaymentMethodLabels,
  PaymentStateColors,
  PaymentStateLabels,
} from '@/features/order-drawer/model';

interface IProps {
  payment: IOrderPayment | null;
  note: string;
  isSaving: boolean;
  onNote: (value: string) => void;
  onReview: (accepted: boolean) => void;
}

const formatMoment = (value: string): string => new Date(value).toLocaleString('ru-RU');

export const RenderPayment = ({ payment, note, isSaving, onNote, onReview }: IProps) => (
  <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <Typography.Text strong className="text-slate-900!">
        {OrderDrawerTexts.payment}
      </Typography.Text>
      <span className="flex items-center gap-2">
        <Tag className="m-0!">
          {PaymentMethodLabels[payment?.method ?? ''] ?? payment?.method}
        </Tag>
        <Tag color={PaymentStateColors[payment?.status ?? ''] ?? 'default'} className="m-0!">
          {PaymentStateLabels[payment?.status ?? ''] ?? payment?.status}
        </Tag>
      </span>
    </header>

    <If
      condition={Boolean(payment?.receiptUrl)}
      fallback={<Empty description={OrderDrawerTexts.noReceipt} />}
    >
      <a href={resolveMediaUrl(payment?.receiptUrl)} target="_blank" rel="noreferrer" className="block">
        <img
          src={resolveMediaUrl(payment?.receiptUrl)}
          alt={OrderDrawerTexts.openReceipt}
          className="max-h-80 w-full rounded-xl border border-slate-200 object-contain"
        />
      </a>

      <If condition={Boolean(payment?.receiptNote)}>
        <Typography.Text className="text-xs! text-slate-500!">
          {`${OrderDrawerTexts.receiptNote}: ${payment?.receiptNote}`}
        </Typography.Text>
      </If>

      <If condition={Boolean(payment?.submittedAt)}>
        <Typography.Text className="text-xs! text-slate-400!">
          {formatMoment(payment?.submittedAt ?? '')}
        </Typography.Text>
      </If>

      <If condition={Boolean(payment?.reviewedAt)}>
        <Typography.Text className="text-xs! text-slate-500!">
          {`${OrderDrawerTexts.reviewedBy}: ${payment?.reviewedBy ?? ''} · ${formatMoment(payment?.reviewedAt ?? '')}${payment?.reviewNote ? ` · ${payment.reviewNote}` : ''}`}
        </Typography.Text>
      </If>

      <Input.TextArea
        value={note}
        onChange={(event) => onNote(event.target.value)}
        placeholder={OrderDrawerTexts.rejectPlaceholder}
        autoSize={{ minRows: 2, maxRows: 4 }}
      />

      <div className="flex flex-wrap gap-2">
        <If condition={payment?.status !== PaymentStates.paid}>
          <Button
            type="primary"
            loading={isSaving}
            onClick={() => onReview(true)}
            className="cursor-pointer!"
          >
            {OrderDrawerTexts.accept}
          </Button>
        </If>
        <If condition={payment?.status !== PaymentStates.failed}>
          <Button
            danger
            loading={isSaving}
            onClick={() => onReview(false)}
            className="cursor-pointer!"
          >
            {OrderDrawerTexts.reject}
          </Button>
        </If>
      </div>
    </If>
  </section>
);
