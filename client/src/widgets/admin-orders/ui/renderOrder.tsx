import { Pressable, Text, View } from 'react-native';
import { IOrder } from '@/entities/order';
import { ManageOrderStatuses } from '@/shared/config';
import { If } from '@/shared/ui';
import { formatDate, formatMoney } from '@/widgets/admin-orders/model';

interface IProps {
  order: IOrder;
  saving: boolean;
  onChangeStatus: (order: IOrder, status: string) => void;
}

const CHIP_BASE = 'rounded-full border px-3 py-1.5';

export const RenderOrder = ({ order, saving, onChangeStatus }: IProps) => (
  <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-bold text-content">{order.number}</Text>
        <Text className="text-xs text-muted">
          {`${formatDate(order.createdAt)} · ${order.customer.name ?? 'без имени'}`}
        </Text>
        <If condition={Boolean(order.customer.phone)}>
          <Text className="text-xs text-muted">{order.customer.phone}</Text>
        </If>
      </View>

      <Text className="text-base font-bold text-content">
        {formatMoney(order.totals.grandTotal, order.totals.currency)}
      </Text>
    </View>

    <Text className="text-xs text-muted">
      {`Позиций: ${order.items.length}`}
    </Text>

    <View className="flex-row flex-wrap gap-2">
      {ManageOrderStatuses.map((status) => (
        <Pressable
          key={status.value}
          accessibilityRole="button"
          disabled={saving}
          onPress={() => onChangeStatus(order, status.value)}
          className={[
            CHIP_BASE,
            order.status === status.value
              ? 'border-primary bg-primary'
              : 'border-line bg-background active:bg-surface',
            saving ? 'opacity-60' : '',
          ].filter(Boolean).join(' ')}
        >
          <Text
            className={[
              'text-xs font-semibold',
              order.status === status.value ? 'text-onPrimary' : 'text-muted',
            ].join(' ')}
          >
            {status.label}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);
