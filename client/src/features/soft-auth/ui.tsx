import { Modal, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppRoutes } from '@/shared/config';
import { Button, Icon } from '@/shared/ui';

interface IProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const SoftAuthModal = ({
  visible,
  title = 'Войдите в аккаунт',
  subtitle = 'Чтобы сохранять избранные товары, отслеживать заказы и получать персональные скидки',
  onClose,
}: IProps) => {
  const router = useRouter();

  if (!visible) {
    return null;
  }

  const handleGoToAuth = () => {
    onClose();
    router.push(AppRoutes.profile);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-background border-t border-line p-6 gap-5 shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Слайдер-индикатор */}
          <View className="w-12 h-1.5 rounded-full bg-line self-center" />

          {/* Иконка и заголовки */}
          <View className="items-center text-center gap-3 pt-1">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Icon name="user" size={28} color="#4f46e5" />
            </View>

            <Text className="text-xl font-extrabold text-content text-center">
              {title}
            </Text>

            <Text className="text-xs text-muted text-center leading-5 px-2">
              {subtitle}
            </Text>
          </View>

          {/* Кнопки действий */}
          <View className="gap-2.5 pt-2 pb-2">
            <Button
              title="Войти по номеру телефона"
              onPress={handleGoToAuth}
              icon={<Icon name="arrow-right" size={16} color="#ffffff" />}
            />

            <Pressable
              onPress={onClose}
              className="py-3 items-center justify-center rounded-xl border border-line bg-surface active:bg-surface/80"
            >
              <Text className="text-xs font-bold text-muted">
                Продолжить как гость
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
