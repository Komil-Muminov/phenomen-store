import { Text, TextInput, View } from 'react-native';
import { IOrder, OrderCard } from '@/entities/order';
import { Button, ButtonVariants, If } from '@/shared/ui';

interface IProfileValues {
  name: string;
  email: string;
}

interface IProps {
  phone: string | null;
  values: IProfileValues;
  orders: IOrder[];
  savingProfile: boolean;
  cancellingId: string | null;
  onChange: (field: keyof IProfileValues, value: string) => void;
  onSave: () => void;
  onCancelOrder: (order: IOrder) => void;
  onLogout: () => void;
}

const Labels = {
  profile: 'Профиль',
  name: 'Имя',
  email: 'E-mail',
  save: 'Сохранить',
  logout: 'Выйти',
  orders: 'Мои заказы',
  empty: 'Заказов пока нет',
} as const;

export const ProfileOrders = ({
  phone,
  values,
  orders,
  savingProfile,
  cancellingId,
  onChange,
  onSave,
  onCancelOrder,
  onLogout,
}: IProps) => (
  <View className="gap-6 px-4 pb-10">
    <View className="gap-3 rounded-brandLg border border-line bg-surface p-4">
      <Text className="text-base font-semibold text-content">{Labels.profile}</Text>
      <Text className="text-sm text-muted">{phone ?? ''}</Text>
      <View className="gap-1">
        <Text className="text-xs text-muted">{Labels.name}</Text>
        <TextInput
          value={values.name}
          onChangeText={(value) => onChange('name', value)}
          className="h-12 rounded-brandSm border border-line bg-background px-3 text-content"
        />
      </View>
      <View className="gap-1">
        <Text className="text-xs text-muted">{Labels.email}</Text>
        <TextInput
          value={values.email}
          onChangeText={(value) => onChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          className="h-12 rounded-brandSm border border-line bg-background px-3 text-content"
        />
      </View>
      <Button title={Labels.save} loading={savingProfile} onPress={onSave} />
      <Button title={Labels.logout} variant={ButtonVariants.ghost} onPress={onLogout} />
    </View>

    <View className="gap-3">
      <Text className="text-base font-semibold text-content">{Labels.orders}</Text>
      <If
        condition={orders.length > 0}
        fallback={<Text className="py-6 text-center text-sm text-muted">{Labels.empty}</Text>}
      >
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            busy={cancellingId === order.id}
            onCancel={onCancelOrder}
          />
        ))}
      </If>
    </View>
  </View>
);
