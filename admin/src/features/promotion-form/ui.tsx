import { useCallback, useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { UiMessages } from '@/shared/config';
import { If } from '@/shared/ui/If';
import {
  IPromotion,
  PromotionKindOptions,
  PromotionKinds,
  PromotionTexts,
} from '@/features/promotions-table';

export interface IPromotionFormValues {
  name: string;
  code: string | null;
  kind: string;
  percent: number;
  amount: number;
  minTotal: number;
  priority: number;
  usageLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

interface IFormState {
  name: string;
  code?: string;
  kind: string;
  percent?: number;
  amount?: number;
  minTotal?: number;
  priority?: number;
  usageLimit?: number | null;
  showRange?: [Dayjs | null, Dayjs | null] | null;
  isActive: boolean;
}

interface IProps {
  open: boolean;
  editing: IPromotion | null;
  isSaving: boolean;
  onSubmit: (values: IPromotionFormValues) => void;
  onCancel: () => void;
}

const toDayjs = (value: string | null): Dayjs | null => (value ? dayjs(value) : null);

export const PromotionForm = ({ open, editing, isSaving, onSubmit, onCancel }: IProps) => {
  const [form] = Form.useForm<IFormState>();
  const kind = Form.useWatch('kind', form) ?? PromotionKinds.cartPercent;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? '',
        code: editing?.code ?? '',
        kind: editing?.kind ?? PromotionKinds.cartPercent,
        percent: editing?.percent || 10,
        amount: editing?.amount || 0,
        minTotal: editing?.minTotal ?? 0,
        priority: editing?.priority ?? 0,
        usageLimit: editing?.usageLimit ?? null,
        showRange: [toDayjs(editing?.startsAt ?? null), toDayjs(editing?.endsAt ?? null)],
        isActive: editing?.isActive ?? true,
      });
    }
  }, [open, editing, form]);

  const handleFinish = useCallback((state: IFormState) => {
    const [startsAt, endsAt] = state.showRange ?? [null, null];

    onSubmit({
      name: state.name.trim(),
      code: state.code?.trim() ? state.code.trim().toUpperCase() : null,
      kind: state.kind,
      percent: state.percent ?? 0,
      amount: state.amount ?? 0,
      minTotal: state.minTotal ?? 0,
      priority: state.priority ?? 0,
      usageLimit: state.usageLimit ?? null,
      startsAt: startsAt ? startsAt.startOf('day').toISOString() : null,
      endsAt: endsAt ? endsAt.endOf('day').toISOString() : null,
      isActive: state.isActive !== false,
    });
  }, [onSubmit]);

  return (
    <Modal
      open={open}
      width={560}
      title={editing ? PromotionTexts.edit : PromotionTexts.create}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={isSaving}
      onOk={form.submit}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder="Летняя распродажа" />
        </Form.Item>

        <Form.Item name="kind" label="Тип скидки">
          <Select options={[...PromotionKindOptions]} />
        </Form.Item>

        <If condition={kind === PromotionKinds.cartPercent}>
          <Form.Item
            name="percent"
            label="Процент скидки"
            rules={[{ required: true, message: UiMessages.required }]}
          >
            <InputNumber min={1} max={100} addonAfter="%" className="w-full!" />
          </Form.Item>
        </If>

        <If condition={kind === PromotionKinds.cartFixed}>
          <Form.Item
            name="amount"
            label="Сумма скидки"
            rules={[{ required: true, message: UiMessages.required }]}
          >
            <InputNumber min={1} addonAfter="смн" className="w-full!" />
          </Form.Item>
        </If>

        <Form.Item name="code" label="Промокод" extra="Пусто — скидка не требует кода">
          <Input placeholder="SUMMER15" className="uppercase!" autoComplete="off" />
        </Form.Item>

        <Form.Item name="minTotal" label="Действует от суммы" extra="0 — без ограничения">
          <InputNumber min={0} addonAfter="смн" className="w-full!" />
        </Form.Item>

        <Form.Item name="showRange" label="Период действия" extra="Пусто — без ограничения">
          <DatePicker.RangePicker allowEmpty={[true, true]} format="DD.MM.YYYY" className="w-full!" />
        </Form.Item>

        <div className="flex flex-wrap items-start gap-4">
          <Form.Item name="usageLimit" label="Лимит использований" className="w-44">
            <InputNumber min={1} placeholder="без лимита" className="w-full!" />
          </Form.Item>

          <Form.Item name="priority" label="Приоритет" extra="Больше — важнее" className="w-32">
            <InputNumber min={0} className="w-full!" />
          </Form.Item>

          <Form.Item name="isActive" label="Работает" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
