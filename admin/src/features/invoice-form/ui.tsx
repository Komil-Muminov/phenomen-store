import { useCallback } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { UiMessages } from '@/shared/config';
import { PlanOptions } from '@/entities/plan';
import { IInvoiceValues, InvoiceFormTexts } from '@/features/invoice-form/model';

interface IProps {
  isOpen: boolean;
  isSaving: boolean;
  tenants: { value: string; label: string }[];
  planPrices: Record<string, number>;
  onSubmit: (values: IInvoiceValues) => void;
  onCancel: () => void;
}

export const InvoiceForm = ({
  isOpen,
  isSaving,
  tenants,
  planPrices,
  onSubmit,
  onCancel,
}: IProps) => {
  const [form] = Form.useForm<IInvoiceValues>();

  const handlePlan = useCallback((plan: string) => {
    form.setFieldValue('amount', planPrices[plan] ?? 0);
  }, [form, planPrices]);

  const handleOk = useCallback(() => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    }).catch(() => undefined);
  }, [form, onSubmit]);

  return (
    <Modal
      open={isOpen}
      title={InvoiceFormTexts.title}
      okText={InvoiceFormTexts.submit}
      cancelText={InvoiceFormTexts.cancel}
      confirmLoading={isSaving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="tenantId"
          label={InvoiceFormTexts.tenant}
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Select options={tenants} showSearch optionFilterProp="label" />
        </Form.Item>

        <Form.Item
          name="plan"
          label={InvoiceFormTexts.plan}
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Select options={PlanOptions} onChange={handlePlan} />
        </Form.Item>

        <Form.Item
          name="period"
          label={InvoiceFormTexts.period}
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <Input placeholder={InvoiceFormTexts.periodPlaceholder} />
        </Form.Item>

        <Form.Item
          name="amount"
          label={InvoiceFormTexts.amount}
          rules={[{ required: true, message: UiMessages.required }]}
        >
          <InputNumber min={1} step={10} addonAfter="сом." className="w-full!" />
        </Form.Item>

        <Form.Item name="dueDate" label={InvoiceFormTexts.dueDate}>
          <Input placeholder={InvoiceFormTexts.dueDatePlaceholder} />
        </Form.Item>

        <Form.Item name="comment" label={InvoiceFormTexts.comment}>
          <Input.TextArea
            placeholder={InvoiceFormTexts.commentPlaceholder}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
