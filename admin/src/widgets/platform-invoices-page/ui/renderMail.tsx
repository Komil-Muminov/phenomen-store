import { useState } from 'react';
import { Alert, Button, Card, Input, Space, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import { IMailStatus, PlatformInvoicesTexts } from '@/widgets/platform-invoices-page/model';

interface IProps {
  status: IMailStatus | null;
  isSending: boolean;
  onSend: (email: string) => void;
}

const pickType = (status: IMailStatus | null): 'success' | 'error' | 'warning' => {
  if (status?.ready) {
    return 'success';
  }

  return status?.configured ? 'error' : 'warning';
};

export const RenderMail = ({ status, isSending, onSend }: IProps) => {
  const [email, setEmail] = useState('');

  return (
    <Card
      title={PlatformInvoicesTexts.mailTitle}
      extra={<span className="text-xs text-slate-500">{PlatformInvoicesTexts.mailHint}</span>}
      className="rounded-2xl! border-slate-200!"
    >
      <Alert
        type={pickType(status)}
        showIcon
        className="mb-4! rounded-xl!"
        message={status?.message ?? ''}
        description={status?.reason
          ? `${PlatformInvoicesTexts.mailReasonLabel}: ${status.reason}`
          : undefined}
      />

      <Space.Compact className="w-full">
        <Input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={PlatformInvoicesTexts.mailPlaceholder}
        />
        <Button
          type="primary"
          loading={isSending}
          disabled={!email.includes('@')}
          onClick={() => onSend(email.trim())}
          className="cursor-pointer!"
        >
          {PlatformInvoicesTexts.mailSend}
        </Button>
      </Space.Compact>

      <If condition={!status?.configured}>
        <Typography.Text className="mt-2 block text-xs! text-slate-500!">
          SMTP_HOST, SMTP_FROM и остальные настройки живут в .env в корне проекта
        </Typography.Text>
      </If>
    </Card>
  );
};
