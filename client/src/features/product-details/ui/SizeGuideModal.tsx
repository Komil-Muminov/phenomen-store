import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from '@/shared/ui';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const SIZE_GRID = [
  { size: 'S (44-46)', chest: '88 - 94 см', waist: '76 - 82 см', hips: '92 - 98 см' },
  { size: 'M (48-50)', chest: '96 - 102 см', waist: '84 - 90 см', hips: '100 - 106 см' },
  { size: 'L (52-54)', chest: '104 - 110 см', waist: '92 - 98 см', hips: '108 - 114 см' },
  { size: 'XL (56)', chest: '112 - 118 см', waist: '100 - 106 см', hips: '116 - 122 см' },
  { size: 'XXL (58)', chest: '120 - 126 см', waist: '108 - 114 см', hips: '124 - 130 см' },
];

export const SizeGuideModal = ({ visible, onClose }: IProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable onPress={onClose} className="flex-1 bg-black/60 justify-end">
      <Pressable onPress={(e) => e.stopPropagation()} className="rounded-t-3xl border-t border-line bg-background p-5 gap-4">
        <View className="flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-lg font-black text-content">Таблица размеров</Text>
            <Text className="text-xs text-muted">Обхват тела в сантиметрах</Text>
          </View>
          <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-line">
            <Icon name="cross" size={14} color="#737373" />
          </Pressable>
        </View>

        <View className="rounded-2xl border border-line bg-surface/50 overflow-hidden">
          <View className="flex-row items-center bg-surface p-3 border-b border-line">
            <Text className="flex-1 text-xs font-bold text-content">Размер</Text>
            <Text className="flex-1 text-xs font-bold text-center text-content">Грудь</Text>
            <Text className="flex-1 text-xs font-bold text-center text-content">Талия</Text>
            <Text className="flex-1 text-xs font-bold text-right text-content">Бедра</Text>
          </View>

          <ScrollView className="max-h-64">
            {SIZE_GRID.map((row, idx) => (
              <View
                key={row.size}
                className={`flex-row items-center p-3 ${
                  idx < SIZE_GRID.length - 1 ? 'border-b border-line/60' : ''
                }`}
              >
                <Text className="flex-1 text-xs font-bold text-content">{row.size}</Text>
                <Text className="flex-1 text-xs text-center text-muted">{row.chest}</Text>
                <Text className="flex-1 text-xs text-center text-muted">{row.waist}</Text>
                <Text className="flex-1 text-xs text-right text-muted">{row.hips}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="rounded-xl bg-primary/5 p-3 border border-primary/20">
          <Text className="text-xs text-primary font-medium leading-5">
            💡 Совет: Если ваши параметры находятся между двумя размерами, рекомендуем выбирать больший размер для комфортной оверсайз посадки.
          </Text>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);
