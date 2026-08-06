import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ICart } from '@/entities/cart';
import { ITenantConfig } from '@/entities/tenant';
import {
  CheckoutForm,
  EMPTY_FORM,
  ICheckoutForm,
  TCheckoutField,
  buildOrderPayload,
  validateForm,
} from '@/features/checkout-form';
import { ApiRoutes, AppRoutes, IdempotencyHeader, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useAuth } from '@/shared/auth';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { createIdempotencyKey } from '@/shared/session';
import { If, StateView } from '@/shared/ui';

interface IOrderResponse {
  id: string;
  number: string;
  totals: { grandTotal: number; currency: string };
}

interface IProfile {
  phone: string | null;
  email: string | null;
  name: string | null;
}

export const CheckoutPage = () => {
  const router = useRouter();
  const { isAuthorized } = useAuth();
  const [form, setForm] = useState<ICheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<TCheckoutField, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idempotencyKey] = useState(createIdempotencyKey);

  const { data: config } = useGetQuery<ITenantConfig>(
    [QueryKeys.tenantConfig],
    ApiRoutes.tenantConfig,
    { staleTime: StaleTimeMs.long },
  );
  const { data: cart, isLoading, error, refetch } = useGetQuery<ICart>(
    [QueryKeys.cart, form.deliveryMethod],
    ApiRoutes.cartGet,
    { params: { deliveryMethod: form.deliveryMethod }, staleTime: StaleTimeMs.short },
  );

  const { data: profile } = useGetQuery<IProfile>(
    [QueryKeys.profile],
    ApiRoutes.authProfile,
    { enabled: isAuthorized, staleTime: StaleTimeMs.medium },
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || (profile?.name ?? ''),
      phone: current.phone || (profile?.phone ?? ''),
      email: current.email || (profile?.email ?? ''),
    }));
  }, [profile?.name, profile?.phone, profile?.email]);

  const createOrder = useMutationQuery<ReturnType<typeof buildOrderPayload>, IOrderResponse>(
    ApiRoutes.ordersCreate,
    {
      invalidate: [[QueryKeys.cart], [QueryKeys.orders]],
      buildHeaders: () => ({ [IdempotencyHeader]: idempotencyKey }),
    },
  );

  const deliveryMethods = useMemo(
    () => (config?.delivery.methods as string[] | undefined) ?? [],
    [config?.delivery.methods],
  );
  const paymentMethods = useMemo(
    () => (config?.payment.methods as string[] | undefined) ?? [],
    [config?.payment.methods],
  );

  const handleChange = useCallback((field: TCheckoutField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateForm(form);

    setErrors(validation);
    setSubmitError(null);

    if (Object.keys(validation).length > 0) {
      return;
    }

    createOrder.mutate(buildOrderPayload(form), {
      onSuccess: (order) => {
        router.replace(`${AppRoutes.orderSuccess}?number=${order.number}&total=${order.totals.grandTotal}`);
      },
      onError: (mutationError) => {
        setSubmitError(mutationError.message);
      },
    });
  }, [createOrder, form, router]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-brandSm border border-line bg-background active:border-primary active:bg-surface"
        >
          <Text className="text-lg text-content">←</Text>
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-content">Оформление</Text>
      </View>

      <If
        condition={Boolean(cart)}
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
          <CheckoutForm
            form={form}
            errors={errors}
            totals={(cart as ICart).totals}
            currencySymbol={config?.locale.currencySymbol ?? ''}
            deliveryMethods={deliveryMethods}
            paymentMethods={paymentMethods}
            busy={createOrder.isPending}
            submitError={submitError}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </If>
    </SafeAreaView>
  );
};
