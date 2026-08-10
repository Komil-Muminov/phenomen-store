import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/shared/ui/Icon';

interface IProps {
  visible: boolean;
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({
  visible,
  message,
  actionText,
  onAction,
  onClose,
  duration = 3000,
}: IProps) => {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute bottom-20 left-4 right-4 z-50 flex-row items-center justify-between gap-3 rounded-2xl bg-content p-3.5 shadow-xl border border-white/10">
      <View className="flex-1 flex-row items-center gap-2.5">
        <Icon name="check" size={16} color="#10b981" />
        <Text className="flex-1 text-xs font-semibold text-white leading-4">
          {message}
        </Text>
      </View>

      {Boolean(actionText && onAction) && (
        <Pressable
          onPress={() => {
            onAction?.();
            onClose();
          }}
          className="rounded-lg bg-white/20 px-2.5 py-1 active:bg-white/30"
        >
          <Text className="text-xs font-bold text-white">{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};
