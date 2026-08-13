import { Badge, Empty, Skeleton, Tag, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import {
  ITicket,
  TicketStatusColors,
  TicketStatusLabels,
  TicketTopicLabels,
} from '@/entities/ticket';
import { TicketsListTexts } from '@/features/tickets-list/model';

interface IProps {
  items: ITicket[];
  isLoading: boolean;
  activeId: string | null;
  isPlatform: boolean;
  onSelect: (id: string) => void;
}

export const TicketsList = ({ items, isLoading, activeId, isPlatform, onSelect }: IProps) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3">
    <If condition={!isLoading} fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
      <If condition={items.length > 0} fallback={<Empty description={TicketsListTexts.empty} />}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={[
              'flex w-full cursor-pointer flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200',
              item.id === activeId
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-transparent bg-slate-50 hover:bg-slate-100',
            ].join(' ')}
          >
            <span className="flex items-center justify-between gap-2">
              <Typography.Text strong className="text-sm! text-slate-900!">
                {item.subject}
              </Typography.Text>
              <Badge
                count={isPlatform ? item.unreadForPlatform : item.unreadForShop}
                size="small"
              />
            </span>

            <span className="flex flex-wrap items-center gap-1.5">
              <Tag color={TicketStatusColors[item.status]} className="m-0!">
                {TicketStatusLabels[item.status] ?? item.status}
              </Tag>
              <Tag className="m-0!">{TicketTopicLabels[item.topic] ?? item.topic}</Tag>
              <If condition={isPlatform}>
                <Typography.Text className="text-xs! text-slate-500!">
                  {item.tenantName}
                </Typography.Text>
              </If>
            </span>

            <Typography.Text ellipsis className="text-xs! text-slate-400!">
              {item.lastText ?? ''}
            </Typography.Text>
          </button>
        ))}
      </If>
    </If>
  </div>
);
