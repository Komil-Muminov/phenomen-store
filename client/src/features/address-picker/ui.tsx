import { Pressable, Text, View } from 'react-native';
import { IAddress, formatAddressTitle } from '@/entities/address';
import { Icon, If } from '@/shared/ui';

interface IProps {
  items: IAddress[];
  selectedId: string | null;
  manual: boolean;
  onSelect: (id: string) => void;
  onManual: () => void;
  onManage: () => void;
}

const PickerTexts = {
  title: 'Сохранённые адреса',
  manual: 'Ввести другой адрес',
  manage: 'Управлять',
  empty: 'Сохранённых адресов пока нет',
} as const;

export const AddressPicker = ({
  items,
  selectedId,
  manual,
  onSelect,
  onManual,
  onManage,
}: IProps) => (
  <View className="gap-2">
    <View className="flex-row items-center justify-between">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
        {PickerTexts.title}
      </Text>
      <Pressable accessibilityRole="button" onPress={onManage} className="active:opacity-70">
        <Text className="text-xs font-bold text-primary">{PickerTexts.manage}</Text>
      </Pressable>
    </View>

    <If
      condition={items.length > 0}
      fallback={<Text className="text-xs text-muted">{PickerTexts.empty}</Text>}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          onPress={() => onSelect(item.id)}
          className={[
            'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
            !manual && item.id === selectedId
              ? 'border-primary bg-primary/10'
              : 'border-line bg-surface',
          ].join(' ')}
        >
          <Icon name="store" size={16} />
          <View className="flex-1">
            <Text className="text-sm font-bold text-content">{formatAddressTitle(item)}</Text>
            <Text className="text-xs text-muted" numberOfLines={1}>{item.line}</Text>
          </View>
          <If condition={!manual && item.id === selectedId}>
            <Icon name="check" size={16} />
          </If>
        </Pressable>
      ))}
    </If>

    <Pressable
      accessibilityRole="button"
      onPress={onManual}
      className={[
        'flex-row items-center gap-3 rounded-2xl border px-4 py-3',
        manual ? 'border-primary bg-primary/10' : 'border-line bg-surface',
      ].join(' ')}
    >
      <Icon name="plus" size={16} />
      <Text className="flex-1 text-sm font-bold text-content">{PickerTexts.manual}</Text>
      <If condition={manual}>
        <Icon name="check" size={16} />
      </If>
    </Pressable>
  </View>
);
