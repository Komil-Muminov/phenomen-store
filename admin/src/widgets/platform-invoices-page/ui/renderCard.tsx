import { useEffect } from 'react';
import { Button, Card, Form, Input } from 'antd';
import {
  IPlatformSettings,
  PlatformInvoicesTexts,
} from '@/widgets/platform-invoices-page/model';

interface IProps {
  settings: IPlatformSettings | null;
  isSaving: boolean;
  onSubmit: (card: IPlatformSettings['card']) => void;
}

export const RenderCard = ({ settings, isSaving, onSubmit }: IProps) => {
  const [form] = Form.useForm<IPlatformSettings['card']>();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings.card);
    }
  }, [settings, form]);

  return (
    <Card
      title={PlatformInvoicesTexts.cardTitle}
      extra={<span className="text-xs text-slate-500">{PlatformInvoicesTexts.cardHint}</span>}
      className="rounded-2xl! border-slate-200!"
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="number" label={PlatformInvoicesTexts.number}>
            <Input placeholder="0000 0000 0000 0000" />
          </Form.Item>
          <Form.Item name="holder" label={PlatformInvoicesTexts.holder}>
            <Input placeholder="KOMIL M" />
          </Form.Item>
          <Form.Item name="bank" label={PlatformInvoicesTexts.bank}>
            <Input placeholder="Алиф Банк" />
          </Form.Item>
          <Form.Item name="note" label={PlatformInvoicesTexts.note}>
            <Input placeholder="В комментарии укажите номер счёта" />
          </Form.Item>
        </div>

        <Button type="primary" htmlType="submit" loading={isSaving} className="cursor-pointer!">
          {PlatformInvoicesTexts.saveCard}
        </Button>
      </Form>
    </Card>
  );
};
