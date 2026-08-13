import { Button, Empty, Input, Space, Tag, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import {
  ConversationStatus,
  IThread,
  SupportTexts,
} from '@/widgets/shop-support-page/model';

interface IProps {
  thread: IThread | null;
  draft: string;
  isSending: boolean;
  isClosing: boolean;
  onDraft: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
}

const formatMoment = (value: string): string => new Date(value).toLocaleString('ru-RU');

export const RenderThread = ({
  thread,
  draft,
  isSending,
  isClosing,
  onDraft,
  onSend,
  onClose,
}: IProps) => (
  <If
    condition={Boolean(thread)}
    fallback={(
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
        <Empty description={SupportTexts.emptyThread} />
      </div>
    )}
  >
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <Typography.Text strong className="block text-slate-900!">
            {thread?.conversation.subject}
          </Typography.Text>
          <Typography.Text className="text-xs! text-slate-500!">
            {`${thread?.conversation.customerName} · ${thread?.conversation.customerPhone ?? thread?.conversation.customerEmail ?? ''}`}
          </Typography.Text>
        </div>

        <Space>
          <Tag color={thread?.conversation.status === ConversationStatus.open ? 'green' : 'default'}>
            {thread?.conversation.status === ConversationStatus.open
              ? SupportTexts.statusOpen
              : SupportTexts.statusClosed}
          </Tag>

          <If condition={thread?.conversation.status === ConversationStatus.open}>
            <Button size="small" loading={isClosing} onClick={onClose} className="cursor-pointer!">
              {SupportTexts.close}
            </Button>
          </If>
        </Space>
      </header>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
        {(thread?.messages ?? []).map((message) => (
          <div
            key={message.id}
            className={message.author === 'shop' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={[
                'max-w-[75%] rounded-2xl px-3.5 py-2.5',
                message.author === 'shop'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-900',
              ].join(' ')}
            >
              <p className="m-0 whitespace-pre-wrap text-sm">{message.text}</p>
              <span
                className={[
                  'mt-1 block text-[11px]',
                  message.author === 'shop' ? 'text-indigo-100' : 'text-slate-400',
                ].join(' ')}
              >
                {formatMoment(message.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <If condition={thread?.conversation.status === ConversationStatus.open}>
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
          <Input.TextArea
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={SupportTexts.replyPlaceholder}
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
          <Button
            type="primary"
            loading={isSending}
            disabled={!draft.trim()}
            onClick={onSend}
            className="cursor-pointer! self-end"
          >
            {SupportTexts.reply}
          </Button>
        </div>
      </If>
    </div>
  </If>
);
