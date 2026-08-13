import { Alert, Button, Empty, Input, Space, Tag, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import {
  ITicketThread,
  TicketStatus,
  TicketStatusColors,
  TicketStatusLabels,
  TicketTopicLabels,
  formatTicketMoment,
} from '@/entities/ticket';
import { TicketThreadTexts } from '@/features/ticket-thread/model';

interface IProps {
  thread: ITicketThread | null;
  side: string;
  draft: string;
  isSending: boolean;
  isClosing: boolean;
  canClose: boolean;
  onDraft: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
}

export const TicketThread = ({
  thread,
  side,
  draft,
  isSending,
  isClosing,
  canClose,
  onDraft,
  onSend,
  onClose,
}: IProps) => (
  <If
    condition={Boolean(thread)}
    fallback={(
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
        <Empty description={TicketThreadTexts.empty} />
      </div>
    )}
  >
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <Typography.Text strong className="block text-slate-900!">
            {thread?.ticket.subject}
          </Typography.Text>
          <Typography.Text className="text-xs! text-slate-500!">
            {`${thread?.ticket.tenantName} · ${thread?.ticket.authorLogin}`}
          </Typography.Text>
        </div>

        <Space>
          <Tag className="m-0!">
            {TicketTopicLabels[thread?.ticket.topic ?? ''] ?? thread?.ticket.topic}
          </Tag>
          <Tag color={TicketStatusColors[thread?.ticket.status ?? '']} className="m-0!">
            {TicketStatusLabels[thread?.ticket.status ?? ''] ?? thread?.ticket.status}
          </Tag>

          <If condition={canClose && thread?.ticket.status !== TicketStatus.closed}>
            <Button size="small" loading={isClosing} onClick={onClose} className="cursor-pointer!">
              {TicketThreadTexts.close}
            </Button>
          </If>
        </Space>
      </header>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
        {(thread?.messages ?? []).map((item) => (
          <div
            key={item.id}
            className={item.author === side ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={[
                'max-w-[75%] rounded-2xl px-3.5 py-2.5',
                item.author === side ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900',
              ].join(' ')}
            >
              <p className="m-0 whitespace-pre-wrap text-sm">{item.text}</p>
              <span
                className={[
                  'mt-1 block text-[11px]',
                  item.author === side ? 'text-indigo-100' : 'text-slate-400',
                ].join(' ')}
              >
                {`${item.authorName ?? ''} · ${formatTicketMoment(item.createdAt)}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <If
        condition={thread?.ticket.status !== TicketStatus.closed}
        fallback={<Alert type="info" message={TicketThreadTexts.closedHint} showIcon />}
      >
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
          <Input.TextArea
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={TicketThreadTexts.replyPlaceholder}
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
          <Button
            type="primary"
            loading={isSending}
            disabled={!draft.trim()}
            onClick={onSend}
            className="cursor-pointer! self-end"
          >
            {TicketThreadTexts.reply}
          </Button>
        </div>
      </If>
    </div>
  </If>
);
