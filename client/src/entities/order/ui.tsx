import { Text, View } from 'react-native';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonSizes, ButtonVariants, If } from '@/shared/ui';
import {
  CancellableStatuses,
  DeliveryStatusLabels,
  IOrder,
  OrderStatusLabels,
  PaymentStateLabels,
  formatOrderDate,
  needsReceipt,
  readTracking,
} from '@/entities/order/model';

interface IProps {
  order: IOrder;
  busy: boolean;
  repeating: boolean;
  onCancel: (order: IOrder) => void;
  onRepeat: (order: IOrder) => void;
  onPay: (order: IOrder) => void;
}

export const OrderCard = ({ order, busy, repeating, onCancel, onRepeat, onPay }: IProps) => (
  <View className="gap-3.5 rounded-2xl border border-line bg-surface/50 p-4">
    <View className="flex-row items-center justify-between">
      <Text className="text-base font-bold text-content">{`Заказ № ${order.number}`}</Text>
      <Text className="text-xs font-medium text-muted">{formatOrderDate(order.createdAt)}</Text>
    </View>

    <View className="flex-row flex-wrap gap-2">
      <View className="rounded-lg bg-primary/10 px-2.5 py-1">
        <Text className="text-xs font-semibold text-primary">
          {OrderStatusLabels[order.status] ?? order.status}
        </Text>
      </View>
      <View className="rounded-lg bg-background border border-line px-2.5 py-1">
        <Text className="text-xs font-medium text-muted">
          {PaymentStateLabels[order.paymentStatus] ?? order.paymentStatus}
        </Text>
      </View>
      <View className="rounded-lg bg-background border border-line px-2.5 py-1">
        <Text className="text-xs font-medium text-muted">
          {`Доставка: ${DeliveryStatusLabels[order.deliveryStatus] ?? order.deliveryStatus}`}
        </Text>
      </View>
    </View>

    <If condition={readTracking(order).length > 0}>
      <View className="gap-0.5 rounded-xl border border-line bg-background p-3">
        {readTracking(order).map((line) => (
          <Text key={line} className="text-xs text-muted">{line}</Text>
        ))}
      </View>
    </If>

    <View className="gap-1.5 pt-0.5">
      {order.items.map((item) => (
        <View key={item.id} className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className="flex-1 text-xs font-medium text-content">
            {`${item.name} · ${Object.values(item.options).filter(Boolean).join(' ')}`}
          </Text>
          <Text className="text-xs font-medium text-muted">{`${item.quantity} шт`}</Text>
        </View>
      ))}
    </View>

    <View className="flex-row items-center justify-between border-t border-line pt-3">
      <Text className="text-xs font-medium text-muted">Итого к оплате</Text>
      <Text className="text-base font-bold text-content">
        {formatPrice(order.totals.grandTotal, order.totals.currency)}
      </Text>
    </View>

    <If condition={needsReceipt(order)}>
      <Button
        title="Оплата переводом"
        variant={ButtonVariants.primary}
        size={ButtonSizes.medium}
        onPress={() => onPay(order)}
      />
    </If>

    <Button
      title="Повторить заказ"
      variant={ButtonVariants.secondary}
      size={ButtonSizes.medium}
      loading={repeating}
      onPress={() => onRepeat(order)}
    />

    <If condition={CancellableStatuses.includes(order.status)}>
      <Button
        title="Отменить заказ"
        variant={ButtonVariants.ghost}
        size={ButtonSizes.medium}
        loading={busy}
        onPress={() => onCancel(order)}
      />
    </If>
  </View>
);
