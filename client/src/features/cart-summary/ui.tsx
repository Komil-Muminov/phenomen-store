import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { DEFAULT_CART_TOTALS, ICartTotals } from '@/entities/cart';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonVariants, If } from '@/shared/ui';
import { SummaryLabels, buildMinOrderMessage, buildSummaryRows } from '@/features/cart-summary/model';

interface IProps {
  totals?: ICartTotals;
  currencySymbol: string;
  promoCode: string | null;
  promoApplied: boolean;
  minOrderTotal: number;
  busy: boolean;
  onApplyPromo: (code: string | null) => void;
  onCheckout: () => void;
}

export const CartSummary = ({
  totals = DEFAULT_CART_TOTALS,
  currencySymbol,
  promoCode,
  promoApplied,
  minOrderTotal,
  busy,
  onApplyPromo,
  onCheckout,
}: IProps) => {
  const [code, setCode] = useState(promoCode ?? '');
  const safeTotals = totals ?? DEFAULT_CART_TOTALS;
  const minOrderMessage = buildMinOrderMessage(safeTotals.itemsTotal, minOrderTotal);

  const freeDeliveryThreshold = 3000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - safeTotals.itemsTotal);
  const deliveryProgress = Math.min(100, Math.round((safeTotals.itemsTotal / freeDeliveryThreshold) * 100));

  return (
    <View className="gap-5 rounded-2xl border border-line bg-surface/50 p-4">
      <View className="gap-2.5 rounded-xl border border-line bg-background p-3.5">
        <If
          condition={remainingForFreeDelivery > 0}
          fallback={
            <Text className="text-xs font-bold text-emerald-600">
              ✓ Вам доступна бесплатная доставка!
            </Text>
          }
        >
          <Text className="text-xs text-muted leading-4">
            До бесплатной доставки осталось{' '}
            <Text className="font-bold text-content">
              {formatPrice(remainingForFreeDelivery, currencySymbol)}
            </Text>
          </Text>
          <View className="h-2 w-full overflow-hidden rounded-full bg-line">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${deliveryProgress}%` }}
            />
          </View>
        </If>
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-semibold text-muted">Промокод</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder={SummaryLabels.promoPlaceholder}
            placeholderTextColor="#a3a3a3"
            autoCapitalize="characters"
            style={{ paddingVertical: 0 }}
            className="h-12 flex-1 rounded-xl border border-line bg-background px-3.5 text-sm font-semibold text-content"
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
      </View>

      <View className="gap-2.5 pt-1 border-t border-line/60">
        {buildSummaryRows(safeTotals).map((row) => (
          <View key={row.key} className="flex-row items-center justify-between">
            <Text className={row.muted ? 'text-xs text-muted' : 'text-sm text-content'}>
              {row.label}
            </Text>
            <Text className={row.muted ? 'text-xs text-muted' : 'text-sm font-semibold text-content'}>
              {row.key === 'delivery' && row.value === 0
                ? SummaryLabels.freeDelivery
                : formatPrice(row.value, currencySymbol)}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between border-t border-line pt-3">
        <Text className="text-base font-bold text-content">{SummaryLabels.total}</Text>
        <Text className="text-2xl font-extrabold text-content">
          {formatPrice(safeTotals.grandTotal, currencySymbol)}
        </Text>
      </View>

      <If condition={Boolean(minOrderMessage)}>
        <Text className="text-xs font-semibold text-danger">{`${minOrderMessage} ${currencySymbol}`}</Text>
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
