import { View } from 'react-native';

interface IProps {
  className?: string;
}

export const SkeletonBox = ({ className }: IProps) => (
  <View className={`animate-pulse bg-neutral-200/70 ${className ?? 'h-4 w-full rounded-md'}`} />
);

export const SkeletonCard = () => (
  <View className="w-44 overflow-hidden rounded-2xl border border-line bg-surface/40 p-3 gap-2.5">
    <SkeletonBox className="h-44 w-full rounded-xl" />
    <SkeletonBox className="h-4 w-3/4 rounded-md" />
    <SkeletonBox className="h-3 w-1/2 rounded-md" />
    <SkeletonBox className="h-5 w-2/3 rounded-md" />
  </View>
);

export const SkeletonCategory = () => (
  <View className="w-[94px] items-center gap-2 rounded-2xl border border-line bg-surface/30 p-2.5">
    <SkeletonBox className="h-16 w-16 rounded-full" />
    <SkeletonBox className="h-3 w-14 rounded-md" />
  </View>
);

export const SkeletonBanner = () => (
  <View className="h-40 w-80 rounded-2xl border border-line bg-surface/50 p-4 justify-end gap-2">
    <SkeletonBox className="h-5 w-1/2 rounded-md bg-neutral-300" />
    <SkeletonBox className="h-3 w-3/4 rounded-md" />
  </View>
);

export const SkeletonProductGrid = () => (
  <View className="flex-row flex-wrap justify-between gap-3 px-4 py-2">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </View>
);
