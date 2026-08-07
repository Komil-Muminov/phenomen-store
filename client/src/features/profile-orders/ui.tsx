import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { IOrder, OrderCard } from '@/entities/order';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';

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
  save: 'Сохранить изменения',
  logout: 'Выйти из профиля',
  orders: 'Мои заказы',
  empty: 'У вас пока нет оформленных заказов',
  statusBadge: 'Покупатель PHENOMEN',
  logoutConfirmTitle: 'Выход из профиля',
  logoutConfirmSubtitle: 'Вы действительно хотите выйти из своей учетной записи?',
  cancel: 'Отмена',
  confirmLogout: 'Да, выйти',
} as const;

const getInitials = (name: string, phone: string | null): string => {
  const trimmed = name.trim();

  if (trimmed.length > 0) {
    const parts = trimmed.split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return trimmed.slice(0, 2).toUpperCase();
  }
  if (phone) {
    const digits = phone.replace(/\D/g, '');

    if (digits.length >= 4) {
      return digits.slice(-2);
    }
  }

  return 'PH';
};

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
}: IProps) => {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <View className="gap-6 px-4 pb-10 pt-2">
      <View className="gap-4 rounded-2xl border border-line bg-surface/50 p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-full border border-line bg-background">
            <Text className="text-lg font-bold text-content">
              {getInitials(values.name, phone)}
            </Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-lg font-bold text-content">
              {values.name.trim() || Labels.profile}
            </Text>
            <Text className="text-xs text-muted">{phone ?? ''}</Text>
            <View className="mt-1 self-start rounded-full bg-primary/10 px-2.5 py-0.5">
              <Text className="text-[10px] font-bold text-primary">{Labels.statusBadge}</Text>
            </View>
          </View>
        </View>

        <View className="gap-3 border-t border-line pt-3">
          <View className="gap-1">
            <Text className="text-xs font-semibold text-muted">{Labels.name}</Text>
            <TextInput
              value={values.name}
              onChangeText={(value) => onChange('name', value)}
              placeholder="Укажите ваше имя"
              placeholderTextColor="#a3a3a3"
              style={{ paddingVertical: 0 }}
              textAlignVertical="center"
              className="h-12 rounded-xl border border-line bg-background px-4 text-sm font-medium text-content"
            />
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold text-muted">{Labels.email}</Text>
            <TextInput
              value={values.email}
              onChangeText={(value) => onChange('email', value)}
              placeholder="example@domain.com"
              placeholderTextColor="#a3a3a3"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ paddingVertical: 0 }}
              textAlignVertical="center"
              className="h-12 rounded-xl border border-line bg-background px-4 text-sm font-medium text-content"
            />
          </View>

          <Button title={Labels.save} loading={savingProfile} onPress={onSave} />

          <If
            condition={confirmLogout}
            fallback={
              <Button
                title={Labels.logout}
                variant={ButtonVariants.ghost}
                onPress={() => setConfirmLogout(true)}
              />
            }
          >
            <View className="gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3.5">
              <Text className="text-sm font-bold text-danger">
                {Labels.logoutConfirmTitle}
              </Text>
              <Text className="text-xs text-muted">{Labels.logoutConfirmSubtitle}</Text>
              <View className="flex-row gap-2 pt-1">
                <View className="flex-1">
                  <Button
                    title={Labels.cancel}
                    variant={ButtonVariants.secondary}
                    onPress={() => setConfirmLogout(false)}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title={Labels.confirmLogout}
                    variant={ButtonVariants.primary}
                    onPress={onLogout}
                  />
                </View>
              </View>
            </View>
          </If>
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-lg font-bold text-content">{Labels.orders}</Text>
        <If
          condition={orders.length > 0}
          fallback={
            <View className="items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface/30 py-8 px-4">
              <Icon name="bag" size={28} color="#a3a3a3" />
              <Text className="text-center text-xs font-medium text-muted">{Labels.empty}</Text>
            </View>
          }
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
};
