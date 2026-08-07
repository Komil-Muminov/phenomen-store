import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IOrder } from '@/entities/order';
import { AuthPhone, AuthSteps, RESEND_DELAY_SEC, TAuthStep } from '@/features/auth-phone';
import { ProfileOrders } from '@/features/profile-orders';
import { ApiRoutes, QueryKeys, StaleTimeMs } from '@/shared/config';
import { useAuth } from '@/shared/auth';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { BottomBar, Icon, If, StateView } from '@/shared/ui';

interface IProfile {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
}

interface IOrderList {
  items: IOrder[];
  total: number;
}

export const ProfilePage = () => {
  const router = useRouter();
  const { isAuthorized, ready, login, logout } = useAuth();
  const [step, setStep] = useState<TAuthStep>(AuthSteps.phone);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [values, setValues] = useState({ name: '', email: '' });
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [resendSeconds, setResendSeconds] = useState(0);

  const { data: profile, isLoading } = useGetQuery<IProfile>(
    [QueryKeys.profile],
    ApiRoutes.authProfile,
    { enabled: isAuthorized, staleTime: StaleTimeMs.medium },
  );
  const { data: orders } = useGetQuery<IOrderList>(
    [QueryKeys.orders],
    ApiRoutes.ordersSearch,
    { enabled: isAuthorized, staleTime: StaleTimeMs.short },
  );

  const requestCode = useMutationQuery<{ phone: string }, { code: string | null }>(ApiRoutes.authCode);
  const verifyCode = useMutationQuery<{ phone: string; code: string }, { token: string }>(ApiRoutes.authVerify);
  const saveProfile = useMutationQuery<{ name: string; email: string }, IProfile>(
    ApiRoutes.authUpdate,
    { method: 'patch', invalidate: [[QueryKeys.profile]] },
  );
  const cancelOrder = useMutationQuery<{ id: string }, IOrder>(
    (body) => `${ApiRoutes.ordersCancel}/${body.id}`,
    { invalidate: [[QueryKeys.orders]] },
  );

  useEffect(() => {
    setValues({ name: profile?.name ?? '', email: profile?.email ?? '' });
  }, [profile?.name, profile?.email]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleRequestCode = useCallback(() => {
    setAuthError(null);
    requestCode.mutate({ phone }, {
      onSuccess: (data) => {
        setDevCode(data.code);
        setStep(AuthSteps.code);
        setResendSeconds(RESEND_DELAY_SEC);
      },
      onError: (error) => setAuthError(error.message),
    });
  }, [phone, requestCode]);

  const handleChangePhone = useCallback(() => {
    setStep(AuthSteps.phone);
    setCode('');
    setDevCode(null);
    setAuthError(null);
    setResendSeconds(0);
  }, []);

  const handleVerify = useCallback(() => {
    setAuthError(null);
    verifyCode.mutate({ phone, code }, {
      onSuccess: async (data) => {
        await login(data.token);
        setCode('');
        setDevCode(null);
        setStep(AuthSteps.phone);
      },
      onError: (error) => setAuthError(error.message),
    });
  }, [code, login, phone, verifyCode]);

  const handleCancelOrder = useCallback((order: IOrder) => {
    setCancellingId(order.id);
    cancelOrder.mutate({ id: order.id }, { onSettled: () => setCancellingId(null) });
  }, [cancelOrder]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-background active:border-primary active:bg-surface"
        >
          <Icon name="arrow-left" size={20} />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-content">Профиль</Text>
      </View>

      <If
        condition={ready}
        fallback={<StateView loading />}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <If
            condition={isAuthorized}
            fallback={(
              <AuthPhone
                step={step}
                phone={phone}
                code={code}
                devCode={devCode}
                errorMessage={authError}
                busy={requestCode.isPending || verifyCode.isPending}
                resendSeconds={resendSeconds}
                onPhoneChange={setPhone}
                onCodeChange={setCode}
                onRequestCode={handleRequestCode}
                onVerify={handleVerify}
                onChangePhone={handleChangePhone}
              />
            )}
          >
            <If condition={!isLoading} fallback={<StateView loading />}>
              <ProfileOrders
                phone={profile?.phone ?? null}
                values={values}
                orders={orders?.items ?? []}
                savingProfile={saveProfile.isPending}
                cancellingId={cancellingId}
                onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
                onSave={() => saveProfile.mutate(values)}
                onCancelOrder={handleCancelOrder}
                onLogout={logout}
              />
            </If>
          </If>
        </ScrollView>
      </If>
      <BottomBar />
    </SafeAreaView>
  );
};
