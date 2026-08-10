import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon, If } from '@/shared/ui';
import { IStockItem, StockTexts, clampStock, formatOptions } from '@/widgets/admin-stock/model';

interface IProps {
  item: IStockItem;
  draft: string | undefined;
  saving: boolean;
  onDraftChange: (id: string, value: string) => void;
  onCommit: (item: IStockItem, value: number) => void;
}

const STEPPER = 'h-10 w-10 items-center justify-center rounded-xl bg-background active:opacity-80';

export const RenderStockRow = ({ item, draft, saving, onDraftChange, onCommit }: IProps) => (
  <View
    className={`gap-3 rounded-2xl border bg-surface p-4 ${item.stock === 0 ? 'border-danger/40' : 'border-line'}`}
  >
    <View className="gap-0.5">
      <Text className="text-sm font-bold text-content" numberOfLines={1}>
        {item.productName}
      </Text>

      <Text className="text-xs text-muted">
        {[item.sku, formatOptions(item.options)].filter(Boolean).join(' · ')}
      </Text>

      <If condition={item.stock === 0}>
        <Text className="text-xs font-semibold text-danger">{StockTexts.outOfStock}</Text>
      </If>
    </View>

    <View className="flex-row items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Уменьшить остаток"
        disabled={saving || item.stock === 0}
        onPress={() => onCommit(item, clampStock(item.stock - 1))}
        className={`${STEPPER} ${item.stock === 0 ? 'opacity-40' : ''}`}
      >
        <Icon name="minus" size={16} />
      </Pressable>

      <TextInput
        value={draft ?? String(item.stock)}
        onChangeText={(next) => onDraftChange(item.id, next)}
        onBlur={() => onCommit(item, clampStock(Number(draft ?? item.stock)))}
        onSubmitEditing={() => onCommit(item, clampStock(Number(draft ?? item.stock)))}
        keyboardType="numeric"
        selectTextOnFocus
        className="h-10 flex-1 rounded-xl border border-line bg-background px-3 text-center text-base font-semibold text-content"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Увеличить остаток"
        disabled={saving}
        onPress={() => onCommit(item, clampStock(item.stock + 1))}
        className={STEPPER}
      >
        <Icon name="plus" size={16} />
      </Pressable>
    </View>
  </View>
);
