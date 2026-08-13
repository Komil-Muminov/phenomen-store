import { Text, View } from 'react-native';
import {
  IReviewsSummary,
  formatReviewDate,
  formatReviewsCount,
  formatStars,
} from '@/entities/review';
import { If } from '@/shared/ui';

interface IProps {
  summary: IReviewsSummary | null;
}

const Texts = {
  title: 'Отзывы покупателей',
  empty: 'Отзывов пока нет — станьте первым',
  reply: 'Ответ магазина',
} as const;

export const ProductReviews = ({ summary }: IProps) => (
  <View className="mt-2 gap-3 border-t border-line px-4 pt-4">
    <View className="flex-row items-center justify-between">
      <Text className="text-sm font-bold text-content">{Texts.title}</Text>
      <If condition={(summary?.totalCount ?? 0) > 0}>
        <Text className="text-xs font-bold text-primary">
          {`${summary?.averageRating} · ${formatReviewsCount(summary?.totalCount ?? 0)}`}
        </Text>
      </If>
    </View>

    <If
      condition={(summary?.reviews.length ?? 0) > 0}
      fallback={<Text className="text-xs text-muted">{Texts.empty}</Text>}
    >
      {(summary?.reviews ?? []).map((review) => (
        <View key={review.id} className="gap-1.5 rounded-2xl border border-line bg-surface p-3.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-content">{review.authorName}</Text>
            <Text className="text-[10px] text-muted">{formatReviewDate(review.createdAt)}</Text>
          </View>
          <Text className="text-xs font-bold text-amber-500">{formatStars(review.rating)}</Text>
          <If condition={Boolean(review.text)}>
            <Text className="text-xs leading-4 text-muted">{review.text}</Text>
          </If>

          <If condition={Boolean(review.reply)}>
            <View className="mt-1 gap-1 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <Text className="text-[10px] font-bold uppercase tracking-wide text-primary">
                {Texts.reply}
              </Text>
              <Text className="text-xs leading-4 text-content">{review.reply}</Text>
            </View>
          </If>
        </View>
      ))}
    </If>
  </View>
);
