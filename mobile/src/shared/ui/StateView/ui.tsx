import { ActivityIndicator, Text, View } from 'react-native';
import { UiMessages } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { If } from '@/shared/ui/If';

interface IProps {
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const StateView = ({ loading = false, errorMessage = null, onRetry }: IProps) => (
  <View className="flex-1 items-center justify-center gap-3 px-8">
    <If
      condition={loading}
      fallback={(
        <>
          <Text className="text-center text-base text-content">{errorMessage ?? UiMessages.loadError}</Text>
          <If condition={Boolean(onRetry)}>
            <Button title={UiMessages.retry} onPress={() => onRetry?.()} fullWidth={false} />
          </If>
        </>
      )}
    >
      <>
        <ActivityIndicator size="large" />
        <Text className="text-sm text-muted">{UiMessages.loading}</Text>
      </>
    </If>
  </View>
);
