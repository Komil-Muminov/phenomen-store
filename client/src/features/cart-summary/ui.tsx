import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ICartTotals } from '@/entities/cart';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonVariants, If } from '@/shared/ui';
import { SummaryLabels, buildMinOrderMessage, buildSummaryRows } from '@/features/cart-summary/model';

interface IProps {
  totals: ICartTotals;
  currencySymbol: string;
  promoCode: string | null;
  promoApplied: boolean;
  minOrderTotal: number;
  busy: boolean;
  onApplyPromo: (code: string | null) => void;
  onCheckout: () => void;
}

export const CartSummary = ({
  totals,
  currencySymbol,
  promoCode,
  promoApplied,
  minOrderTotal,
  busy,
  onApplyPromo,
  onCheckout,
}: IProps) => {
  const [code, setCode] = useState(promoCode ?? '');
  const minOrderMessage = buildMinOrderMessage(totals.itemsTotal, minOrderTotal);

  const freeDeliveryThreshold = 3000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - totals.itemsTotal);
  const deliveryProgress = Math.min(100, Math.round((totals.itemsTotal / freeDeliveryThreshold) * 100));

  return (
    <View className="gap-4 rounded-brandLg border border-line bg-surface p-4">
      <View className="gap-2 rounded-brandSm border border-line bg-background p-3">
        <If
          condition={remainingForFreeDelivery > 0}
          fallback={
            <Text className="text-xs font-semibold text-emerald-600">
              ✓ Вам доступна бесплатная доставка!
            </Text>
          }
        >
          <Text className="text-xs text-muted">
            До бесплатной доставки осталось{' '}
            <Text className="font-bold text-content">
              {formatPrice(remainingForFreeDelivery, currencySymbol)}
            </Text>
          </Text>
          <View className="h-2 w-full overflow-hidden rounded-full bg-line">
            <View
              className="h-full bg-primary"
              style={{ width: `${deliveryProgress}%` }}
            />
          </View>
        </If>
      </View>
      <View className="flex-row gap-2">
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={SummaryLabels.promoPlaceholder}
          autoCapitalize="characters"
          className="h-11 flex-1 rounded-brandSm border border-line bg-background px-3 text-content"
        />
        <Button
          title={promoApplied ? SummaryLabels.promoReset : SummaryLabels.promoApply}
          variant={ButtonVariants.secondary}
          fullWidth={false}
          loading={busy}
          onPress={() => {
            const next = promoApplied ? null : code.trim();

            setCode(promoApplied ? '' : code.trim());
            onApplyPromo(next && next.length > 0 ? next : null);
          }}
        />
      </View>

      {buildSummaryRows(totals).map((row) => (
        <View key={row.key} className="flex-row items-center justify-between">
          <Text className={row.muted ? 'text-xs text-muted' : 'text-sm text-content'}>{row.label}</Text>
          <Text className={row.muted ? 'text-xs text-muted' : 'text-sm text-content'}>
            {row.key === 'delivery' && row.value === 0
              ? SummaryLabels.freeDelivery
              : formatPrice(row.value, currencySymbol)}
          </Text>
        </View>
      ))}

      <View className="flex-row items-center justify-between border-t border-line pt-3">
        <Text className="text-base font-semibold text-content">{SummaryLabels.total}</Text>
        <Text className="text-xl font-bold text-content">
          {formatPrice(totals.grandTotal, currencySymbol)}
        </Text>
      </View>

      <If condition={Boolean(minOrderMessage)}>
        <Text className="text-xs text-danger">{`${minOrderMessage} ${currencySymbol}`}</Text>
      </If>

      <Button
        title={SummaryLabels.checkout}
        disabled={Boolean(minOrderMessage)}
        loading={busy}
        onPress={onCheckout}
      />
    </View>
  );
};
