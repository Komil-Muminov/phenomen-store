import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { IOrder, OrderCard } from '@/entities/order';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import { IProfileValues, ProfileForm } from '@/features/profile-form';

interface IProps {
  email: string | null;
  onOpenSupport: () => void;
  values: IProfileValues;
  orders: IOrder[];
  savingProfile: boolean;
  profileError: string | null;
  cancellingId: string | null;
  repeatingId: string | null;
  onChange: (values: IProfileValues) => void;
  onSave: () => void;
  onChangeEmail: () => void;
  onCancelOrder: (order: IOrder) => void;
  onRepeatOrder: (order: IOrder) => void;
  onOpenAddresses: () => void;
  onLogout: () => void;
}

const Labels = {
  profile: 'Профиль',
  emailLogin: 'Почта для входа',
  changeEmail: 'Изменить',
  save: 'Сохранить изменения',
  logout: 'Выйти из профиля',
  orders: 'Мои заказы',
  support: 'Написать в магазин',
  supportHint: 'Вопрос по заказу, возврат, доставка',
  addresses: 'Адреса доставки',
  addressesHint: 'Сохраните адрес, чтобы не вводить его каждый раз',
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
  email,
  onOpenSupport,
  values,
  orders,
  savingProfile,
  profileError,
  cancellingId,
  repeatingId,
  onChange,
  onSave,
  onChangeEmail,
  onCancelOrder,
  onRepeatOrder,
  onOpenAddresses,
  onLogout,
}: IProps) => {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <View className="gap-6 px-4 pb-10 pt-2">
      <View className="gap-4 rounded-2xl border border-line bg-surface/50 p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-full border border-line bg-background">
            <Text className="text-lg font-bold text-content">
              {getInitials(`${values.name} ${values.lastName}`, values.phone)}
            </Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-lg font-bold text-content">
              {`${values.name} ${values.lastName}`.trim() || Labels.profile}
            </Text>
            <Text className="text-xs text-muted">{values.phone}</Text>
            <View className="mt-1 self-start rounded-full bg-primary/10 px-2.5 py-0.5">
              <Text className="text-[10px] font-bold text-primary">{Labels.statusBadge}</Text>
            </View>
          </View>
        </View>

        <View className="gap-4 border-t border-line pt-3">
          <ProfileForm
            values={values}
            welcome={false}
            busy={savingProfile}
            errorMessage={profileError}
            onChange={onChange}
            onSubmit={onSave}
          />

          <View className="gap-1.5">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              {Labels.emailLogin}
            </Text>
            <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-line bg-background px-4 py-3">
              <Text className="flex-1 text-sm font-semibold text-content" numberOfLines={1}>
                {email ?? ''}
              </Text>
              <Pressable
                onPress={onChangeEmail}
                accessibilityRole="button"
                className="rounded-full bg-primary/10 px-3 py-1.5 active:opacity-80"
              >
                <Text className="text-xs font-bold text-primary">{Labels.changeEmail}</Text>
              </Pressable>
            </View>
          </View>

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
        <Pressable
          accessibilityRole="button"
          onPress={onOpenSupport}
          className="mb-2 flex-row items-center gap-3 rounded-2xl border border-line bg-surface/50 p-4 active:opacity-80"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="chat" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-content">{Labels.support}</Text>
            <Text className="text-xs text-muted">{Labels.supportHint}</Text>
          </View>
          <Icon name="chevron-right" size={16} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenAddresses}
          className="mb-2 flex-row items-center gap-3 rounded-2xl border border-line bg-surface/50 p-4 active:opacity-80"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="store" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-content">{Labels.addresses}</Text>
            <Text className="text-xs text-muted">{Labels.addressesHint}</Text>
          </View>
          <Icon name="chevron-right" size={16} />
        </Pressable>

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
              repeating={repeatingId === order.id}
              onCancel={onCancelOrder}
              onRepeat={onRepeatOrder}
            />
          ))}
        </If>
      </View>
    </View>
  );
};
