import { Button, Empty, Input, Rate, Skeleton, Tag, Typography } from 'antd';
import { If } from '@/shared/ui/If';
import { IReview, formatReviewMoment, ratingColor } from '@/entities/review';
import { ReviewsTexts } from '@/features/reviews-table/model';

interface IProps {
  items: IReview[];
  isLoading: boolean;
  activeId: string | null;
  draft: string;
  isSending: boolean;
  onDraft: (value: string) => void;
  onOpen: (review: IReview) => void;
  onCancel: () => void;
  onSend: () => void;
}

export const ReviewsTable = ({
  items,
  isLoading,
  activeId,
  draft,
  isSending,
  onDraft,
  onOpen,
  onCancel,
  onSend,
}: IProps) => (
  <div className="flex flex-col gap-3">
    <If condition={!isLoading} fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
      <If condition={items.length > 0} fallback={<Empty description={ReviewsTexts.empty} />}>
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Typography.Text strong className="block text-slate-900!">
                  {item.productName}
                </Typography.Text>
                <Typography.Text className="text-xs! text-slate-500!">
                  {`${item.authorName} · ${formatReviewMoment(item.createdAt)}`}
                </Typography.Text>
              </div>
              <span className="flex items-center gap-2">
                <Rate disabled value={item.rating} className="text-sm!" />
                <Tag color={ratingColor(item.rating)} className="m-0!">{item.rating}</Tag>
              </span>
            </header>

            <p className="m-0 whitespace-pre-wrap text-sm text-slate-700">{item.text}</p>

            <If condition={Boolean(item.reply)}>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <Typography.Text strong className="block text-xs! text-indigo-700!">
                  {ReviewsTexts.replyTitle}
                </Typography.Text>
                <p className="m-0 whitespace-pre-wrap text-sm text-slate-700">{item.reply}</p>
                <Typography.Text className="text-[11px]! text-slate-400!">
                  {`${item.replyAuthor ?? ''} · ${item.replyAt ? formatReviewMoment(item.replyAt) : ''}`}
                </Typography.Text>
              </div>
            </If>

            <If
              condition={item.id === activeId}
              fallback={(
                <Button
                  size="small"
                  onClick={() => onOpen(item)}
                  className="cursor-pointer! self-start"
                >
                  {item.reply ? ReviewsTexts.edit : ReviewsTexts.reply}
                </Button>
              )}
            >
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Input.TextArea
                  value={draft}
                  onChange={(event) => onDraft(event.target.value)}
                  placeholder={ReviewsTexts.replyPlaceholder}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                />
                <span className="flex gap-2 self-end">
                  <Button size="small" onClick={onCancel} className="cursor-pointer!">
                    {ReviewsTexts.cancel}
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    loading={isSending}
                    disabled={!draft.trim()}
                    onClick={onSend}
                    className="cursor-pointer!"
                  >
                    {ReviewsTexts.send}
                  </Button>
                </span>
              </div>
            </If>
          </article>
        ))}
      </If>
    </If>
  </div>
);
