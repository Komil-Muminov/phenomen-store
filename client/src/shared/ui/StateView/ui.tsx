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
    <View className="flex-1 items-center pt-16 gap-4 px-8 pb-12">
      <If
        condition={loading}
        fallback={(
          <View className="items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-danger/10">
              <Icon name="cross" size={24} color="#ef4444" />
            </View>
            <Text className="text-center text-sm font-semibold text-content max-w-xs">
              {errorMessage ?? UiMessages.loadError}
            </Text>
            <If condition={Boolean(onRetry)}>
              <View className="pt-2">
                <Button title={UiMessages.retry} onPress={() => onRetry?.()} fullWidth={false} />
              </View>
            </If>
          </View>
        )}
      >
        <View className="items-center gap-3">
          <ActivityIndicator size="large" color="#171717" />
          <Text className="text-xs font-medium text-muted">{UiMessages.loading}</Text>
        </View>
      </If>
    </View>
  );
};
