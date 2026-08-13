import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EMPTY_ADDRESS,
  IAddress,
  IAddressList,
  IAddressValues,
  formatAddressTitle,
  toValues,
  validateAddress,
} from '@/entities/address';
import { AddressForm } from '@/features/address-form';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useGetQuery } from '@/shared/hooks';
import { Button, ButtonSizes, ButtonVariants, Icon, If, StateView } from '@/shared/ui';
import { useAddressMutations } from '@/widgets/addresses-page/lib';

const Texts = {
  title: 'Адреса доставки',
  add: 'Добавить адрес',
  empty: 'Сохранённых адресов пока нет',
  hint: 'Сохранённый адрес можно выбрать при оформлении заказа',
  makeDefault: 'Сделать основным',
  isDefault: 'Основной',
  edit: 'Изменить',
  remove: 'Удалить',
} as const;

export const AddressesPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState<IAddress | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<IAddressValues>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Partial<Record<keyof IAddressValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useGetQuery<IAddressList>(
    [QueryKeys.addresses],
    ApiRoutes.addressesSearch,
    { staleTime: StaleTimeMs.short },
  );

  const mutations = useAddressMutations();

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setValues(EMPTY_ADDRESS);
    setErrors({});
    setSubmitError(null);
  }, []);

  const openForm = useCallback((address: IAddress | null) => {
    setEditing(address);
    setValues(address ? toValues(address) : EMPTY_ADDRESS);
    setErrors({});
    setSubmitError(null);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateAddress(values);

    setErrors(validation);
    setSubmitError(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const onError = (mutationError: Error) => setSubmitError(mutationError.message);

    if (editing) {
      mutations.update.mutate({ ...values, id: editing.id }, { onSuccess: closeForm, onError });

      return;
    }

    mutations.create.mutate(values, { onSuccess: closeForm, onError });
  }, [values, editing, mutations, closeForm]);

  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);
  const items = data?.items ?? [];
  const busy = mutations.create.isPending || mutations.update.isPending;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="arrow-left" size={20} />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-content">{Texts.title}</Text>
      </View>

      <If
        condition={Boolean(data)}
        fallback={(
          <StateView
            loading={isLoading}
            errorMessage={error?.message ?? null}
            onRetry={() => {
              refetch();
            }}
          />
        )}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="gap-4 px-4 pb-10 pt-2">
            <Text className="text-xs text-muted">{Texts.hint}</Text>

            <If
              condition={items.length > 0}
              fallback={(
                <View className="items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface/30 px-4 py-8">
                  <Icon name="store" size={28} color="#a3a3a3" />
                  <Text className="text-center text-xs font-medium text-muted">{Texts.empty}</Text>
                </View>
              )}
            >
              {items.map((item) => (
                <View key={item.id} className="gap-3 rounded-2xl border border-line bg-surface/50 p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-content">
                        {formatAddressTitle(item)}
                      </Text>
                      <Text className="text-xs text-muted">{item.line}</Text>
                    </View>
                    <If condition={item.isDefault}>
                      <View className="rounded-full bg-primary/10 px-2.5 py-1">
                        <Text className="text-[10px] font-bold text-primary">{Texts.isDefault}</Text>
                      </View>
                    </If>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    <If condition={!item.isDefault}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => mutations.makeDefault.mutate({ id: item.id })}
                        className="rounded-full border border-line px-3 py-1.5 active:opacity-70"
                      >
                        <Text className="text-xs font-bold text-content">{Texts.makeDefault}</Text>
                      </Pressable>
                    </If>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openForm(item)}
                      className="rounded-full border border-line px-3 py-1.5 active:opacity-70"
                    >
                      <Text className="text-xs font-bold text-content">{Texts.edit}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => mutations.remove.mutate({ id: item.id })}
                      className="rounded-full border border-danger/40 px-3 py-1.5 active:opacity-70"
                    >
                      <Text className="text-xs font-bold text-danger">{Texts.remove}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </If>

            <If
              condition={isFormOpen}
              fallback={(
                <Button
                  title={Texts.add}
                  variant={ButtonVariants.secondary}
                  size={ButtonSizes.medium}
                  onPress={() => openForm(null)}
                />
              )}
            >
              <AddressForm
                values={values}
                errors={errors}
                isEditing={Boolean(editing)}
                busy={busy}
                errorMessage={submitError}
                onChange={setValues}
                onSubmit={handleSubmit}
                onCancel={closeForm}
              />
            </If>
          </View>
        </ScrollView>
      </If>
    </View>
  );
};
