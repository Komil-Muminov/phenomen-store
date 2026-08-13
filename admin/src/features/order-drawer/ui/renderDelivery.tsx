import { Button, Input, Select, Typography } from 'antd';
import {
  DeliveryStatuses,
  IDeliveryValues,
  OrderDrawerTexts,
  formatHistoryLabel,
} from '@/features/order-drawer/model';
import type { IOrderHistoryEntry } from '@/entities/shop';

interface IProps {
  values: IDeliveryValues;
  history: IOrderHistoryEntry[];
  isSaving: boolean;
  onChange: (values: IDeliveryValues) => void;
  onSave: () => void;
}

const formatMoment = (value: string): string => new Date(value).toLocaleString('ru-RU');

export const RenderDelivery = ({ values, history, isSaving, onChange, onSave }: IProps) => (
  <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
    <Typography.Text strong className="text-slate-900!">
      {OrderDrawerTexts.delivery}
    </Typography.Text>

    <Select
      value={values.status}
      onChange={(status) => onChange({ ...values, status })}
      options={DeliveryStatuses}
      className="w-full"
    />

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input
        value={values.courierName}
        onChange={(event) => onChange({ ...values, courierName: event.target.value })}
        placeholder={OrderDrawerTexts.courierName}
      />
      <Input
        value={values.courierPhone}
        onChange={(event) => onChange({ ...values, courierPhone: event.target.value })}
        placeholder={OrderDrawerTexts.courierPhone}
      />
      <Input
        value={values.trackingNumber}
        onChange={(event) => onChange({ ...values, trackingNumber: event.target.value })}
        placeholder={OrderDrawerTexts.trackingNumber}
      />
      <Input
        value={values.eta}
        onChange={(event) => onChange({ ...values, eta: event.target.value })}
        placeholder={OrderDrawerTexts.eta}
      />
    </div>

    <Button
      type="primary"
      loading={isSaving}
      onClick={onSave}
      className="cursor-pointer! self-start"
    >
      {OrderDrawerTexts.save}
    </Button>

    <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
      <Typography.Text strong className="text-xs! text-slate-500!">
        {OrderDrawerTexts.history}
      </Typography.Text>
      {history.map((entry) => (
        <Typography.Text key={`${entry.status}-${entry.createdAt}`} className="text-xs! text-slate-500!">
          {`${formatMoment(entry.createdAt)} — ${formatHistoryLabel(entry.status)}${entry.comment ? ` (${entry.comment})` : ''}`}
        </Typography.Text>
      ))}
    </div>
  </section>
);
