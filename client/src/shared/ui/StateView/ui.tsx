import { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { UiMessages } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { If } from '@/shared/ui/If';

interface IProps {
  loading?: boolean;
  errorMessage?: string | null;
  skeleton?: ReactNode;
  onRetry?: () => void;
}

export const StateView = ({ loading = false, errorMessage = null, skeleton, onRetry }: IProps) => {
  if (loading && skeleton) {
    return <>{skeleton}</>;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 py-12">
      <If
        condition={loading}
        fallback={(
          <View className="w-full max-w-sm items-center gap-4 rounded-3xl border border-line bg-surface p-6 shadow-md backdrop-blur-md">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 shadow-xs">
              <Icon name="cross" size={26} color="#ef4444" />
            </View>
            <Text className="text-center text-sm font-semibold leading-5 text-content">
              {errorMessage ?? UiMessages.loadError}
            </Text>
            <If condition={Boolean(onRetry)}>
              <View className="pt-2 w-full">
                <Button title={UiMessages.retry} onPress={() => onRetry?.()} fullWidth={true} />
              </View>
            </If>
          </View>
        )}
      >
        <View className="items-center gap-3.5 rounded-3xl border border-line bg-surface px-8 py-6 shadow-md">
          <ActivityIndicator size="large" color="#0f172a" />
          <Text className="text-xs font-semibold tracking-wide text-muted">{UiMessages.loading}</Text>
        </View>
      </If>
    </View>
  );
};
