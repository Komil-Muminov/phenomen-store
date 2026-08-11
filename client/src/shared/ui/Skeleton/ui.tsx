import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface IProps {
  className?: string;
}

export const SkeletonBox = ({ className }: IProps) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.95, { duration: 750 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`bg-slate-200/90 dark:bg-slate-800/90 ${className ?? 'h-4 w-full rounded-lg'}`}
    />
  );
};

export const SkeletonCard = () => (
  <View className="w-44 overflow-hidden rounded-3xl border border-line bg-surface p-3 gap-2.5 shadow-sm">
    <SkeletonBox className="h-44 w-full rounded-2xl" />
    <SkeletonBox className="h-4 w-3/4 rounded-md" />
    <SkeletonBox className="h-3 w-1/2 rounded-md" />
    <SkeletonBox className="h-5 w-2/3 rounded-md" />
  </View>
);

export const SkeletonCategory = () => (
  <View className="w-[94px] items-center gap-2 rounded-2xl border border-line bg-surface p-2.5 shadow-xs">
    <SkeletonBox className="h-16 w-16 rounded-full" />
    <SkeletonBox className="h-3 w-14 rounded-md" />
  </View>
);

export const SkeletonBanner = () => (
  <View className="h-40 w-80 rounded-3xl border border-line bg-surface p-4 justify-end gap-2 shadow-xs">
    <SkeletonBox className="h-5 w-1/2 rounded-md bg-slate-300" />
    <SkeletonBox className="h-3 w-3/4 rounded-md" />
  </View>
);

const DEFAULT_SKELETON_COUNT = 4;

interface IGridProps {
  count?: number;
}

export const SkeletonProductGrid = ({ count = DEFAULT_SKELETON_COUNT }: IGridProps) => (
  <View className="flex-row flex-wrap justify-between gap-3 px-4 py-2">
    {Array.from({ length: count }, (_item, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);
