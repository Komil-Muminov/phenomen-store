import { Text, View } from 'react-native';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonSizes, ButtonVariants, If } from '@/shared/ui';
import {
  CancellableStatuses,
  IOrder,
  OrderStatusLabels,
  PaymentStatusLabels,
  formatOrderDate,
} from '@/entities/order/model';

interface IProps {
  order: IOrder;
  busy: boolean;
  onCancel: (order: IOrder) => void;
}

export const OrderCard = ({ order, busy, onCancel }: IProps) => (
  <View className="gap-3 rounded-brandLg border border-line bg-background p-4">
    <View className="flex-row items-center justify-between">
      <Text className="text-base font-semibold text-content">{`№ ${order.number}`}</Text>
      <Text className="text-xs text-muted">{formatOrderDate(order.createdAt)}</Text>
    </View>

    <View className="flex-row flex-wrap gap-2">
      <View className="rounded-brandSm bg-surface px-2 py-1">
        <Text className="text-xs text-content">{OrderStatusLabels[order.status] ?? order.status}</Text>
      </View>
      <View className="rounded-brandSm bg-surface px-2 py-1">
        <Text className="text-xs text-muted">
          {PaymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
        </Text>
      </View>
    </View>

    <View className="gap-1">
      {order.items.map((item) => (
        <View key={item.id} className="flex-row items-center justify-between">
          <Text numberOfLines={1} className="flex-1 text-sm text-content">
            {`${item.name} · ${Object.values(item.options).filter(Boolean).join(' ')}`}
          </Text>
          <Text className="text-sm text-muted">{`${item.quantity} шт`}</Text>
        </View>
      ))}
    </View>

    <View className="flex-row items-center justify-between border-t border-line pt-3">
      <Text className="text-sm text-muted">Итого</Text>
      <Text className="text-base font-semibold text-content">
        {formatPrice(order.totals.grandTotal, order.totals.currency)}
      </Text>
    </View>

    <If condition={CancellableStatuses.includes(order.status)}>
      <Button
        title="Отменить заказ"
        variant={ButtonVariants.secondary}
        size={ButtonSizes.medium}
        loading={busy}
        onPress={() => onCancel(order)}
      />
    </If>
  </View>
);
