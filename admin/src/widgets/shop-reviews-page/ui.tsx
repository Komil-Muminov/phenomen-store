import { useCallback, useState } from 'react';
import { Alert, App as AntApp, Select, Space } from 'antd';
import { extractErrorMessage } from '@/shared/api';
import { ApiRoutes, ListLimits, QueryKeys, UiMessages } from '@/shared/config';
import { useGetQuery, useListQuery, useMutationQuery } from '@/shared/hooks';
import { buildListKey, buildListParams } from '@/shared/lib';
import { If } from '@/shared/ui/If';
import { ListPagination } from '@/shared/ui/ListPagination';
import { ListToolbar } from '@/shared/ui/ListToolbar';
import {
  AnsweredOptions,
  IReview,
  IReviewList,
  RatingOptions,
  formatReviewFilter,
  parseReviewFilter,
} from '@/entities/review';
import { ReviewsTable } from '@/features/reviews-table';

const ReviewsPageTexts = {
  title: 'Отзывы',
  subtitle: 'Оценки покупателей и ответы магазина',
  searchPlaceholder: 'Товар, автор или текст отзыва',
  sent: 'Ответ опубликован',
} as const;

export const ShopReviewsPage = () => {
  const { message } = AntApp.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const { draft: filters, applied, setFilter, setSearch, setPage } = useListQuery({
    rating: undefined as string | undefined,
    answered: undefined as string | undefined,
  });

  const listQuery = useGetQuery<IReviewList>(
    [QueryKeys.shopReviews, ...buildListKey(applied)],
    ApiRoutes.shopReviewsSearch,
    { scope: 'shop', params: buildListParams(applied, ListLimits.default) },
  );

  const replyMutation = useMutationQuery<{ id: string; text: string }, IReview>(
    (body) => `${ApiRoutes.shopReviewReply}/${body.id}`,
    { scope: 'shop', invalidate: [[QueryKeys.shopReviews]] },
  );

  const handleOpen = useCallback((review: IReview) => {
    setActiveId(review.id);
    setDraft(review.reply ?? '');
  }, []);

  const handleCancel = useCallback(() => {
    setActiveId(null);
    setDraft('');
  }, []);

  const handleSend = useCallback(() => {
    if (!activeId) {
      return;
    }

    replyMutation.mutate({ id: activeId, text: draft.trim() }, {
      onSuccess: () => {
        message.success(ReviewsPageTexts.sent);
        handleCancel();
      },
      onError: (error) => message.error(extractErrorMessage(error)),
    });
  }, [activeId, draft, replyMutation, message, handleCancel]);

  const total = listQuery.data?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <ListToolbar
        title={ReviewsPageTexts.title}
        subtitle={`${ReviewsPageTexts.subtitle} — найдено: ${total}`}
        search={filters.search}
        searchPlaceholder={ReviewsPageTexts.searchPlaceholder}
        isFetching={listQuery.isFetching}
        onSearch={setSearch}
        onRefresh={() => listQuery.refetch()}
        filters={(
          <Space wrap>
            <Select
              value={formatReviewFilter(filters.answered)}
              onChange={(value) => setFilter({ answered: parseReviewFilter(value) })}
              options={AnsweredOptions}
              className="w-40"
            />
            <Select
              value={formatReviewFilter(filters.rating)}
              onChange={(value) => setFilter({ rating: parseReviewFilter(value) })}
              options={RatingOptions}
              className="w-40"
            />
          </Space>
        )}
      />

      <If
        condition={!listQuery.isError}
        fallback={<Alert type="error" message={UiMessages.loadError} showIcon />}
      >
        <ReviewsTable
          items={listQuery.data?.items ?? []}
          isLoading={listQuery.isLoading}
          activeId={activeId}
          draft={draft}
          isSending={replyMutation.isPending}
          onDraft={setDraft}
          onOpen={handleOpen}
          onCancel={handleCancel}
          onSend={handleSend}
        />
      </If>

      <ListPagination
        current={applied.page}
        pageSize={ListLimits.default}
        total={total}
        onChange={setPage}
      />
    </section>
  );
};
