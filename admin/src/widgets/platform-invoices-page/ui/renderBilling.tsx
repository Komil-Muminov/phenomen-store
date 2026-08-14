import { useEffect } from 'react';
import { Button, Card, Empty, Form, InputNumber, Space, Switch, Tag, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import {
  IBillingSettings,
  IBlockedTenant,
  PlatformInvoicesTexts,
} from '@/widgets/platform-invoices-page/model';

interface IProps {
  settings: IBillingSettings | null;
  blocked: IBlockedTenant[];
  isSaving: boolean;
  isRunning: boolean;
  releasingKey: string | null;
  onSubmit: (values: IBillingSettings) => void;
  onRun: () => void;
  onRelease: (tenant: IBlockedTenant) => void;
}

const formatMoment = (value: string): string => new Date(value).toLocaleString('ru-RU');

export const RenderBilling = ({
  settings,
  blocked,
  isSaving,
  isRunning,
  releasingKey,
  onSubmit,
  onRun,
  onRelease,
}: IProps) => {
  const [form] = Form.useForm<IBillingSettings>();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  return (
    <Card
      title={PlatformInvoicesTexts.billingTitle}
      extra={(
        <Button loading={isRunning} onClick={onRun} className="cursor-pointer!">
          {PlatformInvoicesTexts.runCheck}
        </Button>
      )}
      className="rounded-2xl! border-slate-200!"
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <Space wrap align="end" size="large">
          <Form.Item
            name="graceDays"
            label={PlatformInvoicesTexts.graceDays}
            extra={PlatformInvoicesTexts.graceHint}
          >
            <InputNumber min={0} max={60} addonAfter="дн." />
          </Form.Item>
          <Form.Item
            name="remindDays"
            label={PlatformInvoicesTexts.remindDays}
            extra={PlatformInvoicesTexts.remindHint}
          >
            <InputNumber min={0} max={30} addonAfter="дн." />
          </Form.Item>
          <Form.Item name="autoBlock" label={PlatformInvoicesTexts.autoBlock} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSaving} className="cursor-pointer!">
              {PlatformInvoicesTexts.saveBilling}
            </Button>
          </Form.Item>
        </Space>
      </Form>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
        <Typography.Text strong className="text-sm! text-slate-900!">
          {PlatformInvoicesTexts.blockedTitle}
        </Typography.Text>

        <If
          condition={blocked.length > 0}
          fallback={<Empty description={PlatformInvoicesTexts.blockedEmpty} />}
        >
          {blocked.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5"
            >
              <div>
                <Typography.Text strong className="block text-slate-900!">
                  {`${item.name} (${item.key})`}
                </Typography.Text>
                <Typography.Text className="text-xs! text-slate-500!">
                  {`${item.reason ?? ''} · с ${formatMoment(item.blockedAt)}`}
                </Typography.Text>
              </div>
              <Space>
                <Tag color="red" className="m-0!">
                  {`${item.overdueCount} счёт · ${item.overdueAmount.toLocaleString('ru-RU')}`}
                </Tag>
                <Button
                  size="small"
                  loading={releasingKey === item.id}
                  onClick={() => onRelease(item)}
                  className="cursor-pointer!"
                >
                  {PlatformInvoicesTexts.release}
                </Button>
              </Space>
            </div>
          ))}
        </If>
      </div>
    </Card>
  );
};
