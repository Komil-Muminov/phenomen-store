import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOrder } from '@/entities/order';
import { AuthSteps, RESEND_DELAY_SEC, TAuthStep } from '@/features/auth-phone';
import {
  EMPTY_CREDENTIALS,
  IStaffCredentials,
  ISigninResult,
  isStaffIdentifier,
} from '@/features/auth-staff';
import { ProfileOrders } from '@/features/profile-orders';
import { ApiRoutes, AppRoutes, QueryKeys, StaffScopes, StaleTimeMs } from '@/shared/config';
import { useStaffAuth } from '@/shared/staff-auth';
import { RenderAuth } from '@/widgets/profile-page/ui/renderAuth';
import { useAuth } from '@/shared/auth';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { toHref } from '@/shared/lib';
import { BottomBar, If } from '@/shared/ui';

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
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);
  const { isAuthorized, ready, login, logout } = useAuth();
  const { signIn: staffSignIn } = useStaffAuth();
  const [credentials, setCredentials] = useState<IStaffCredentials>(EMPTY_CREDENTIALS);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [step, setStep] = useState<TAuthStep>(AuthSteps.phone);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [values, setValues] = useState({ name: '', email: '' });
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [resendSeconds, setResendSeconds] = useState(0);

  const staffMode = isStaffIdentifier(phone);

  const handleIdentifierChange = useCallback((value: string) => {
    setAuthError(null);
    setStaffError(null);
    setPhone(value);
    setCredentials((current) => ({ ...current, login: value.trim() }));
  }, []);

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

  const staffSignin = useMutationQuery<IStaffCredentials, ISigninResult>(ApiRoutes.staffSignin);
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

  const handleStaffSubmit = useCallback(() => {
    setStaffError(null);

    staffSignin.mutate(
      { login: credentials.login.trim(), password: credentials.password },
      {
        onSuccess: (result) => {
          staffSignIn({
            token: result.token,
            scope: result.scope,
            name: result.user?.name ?? result.name ?? result.login ?? '',
            role: result.user?.role ?? result.role ?? '',
            tenantKey: result.scope === StaffScopes.shop ? result.tenantKey ?? null : null,
            tenantName: result.tenantName ?? null,
          }).then(() => {
            setCredentials(EMPTY_CREDENTIALS);
            setPhone('');
            router.replace(toHref(AppRoutes.admin));
          });
        },
        onError: (error) => setStaffError(error.message),
      },
    );
  }, [staffSignin, credentials, staffSignIn, router]);

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
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
        <Text className="text-xl font-extrabold tracking-tight text-content">Профиль</Text>
      </View>

      <If
        condition={ready}
        fallback={(
          <View className="flex-1 px-4 pt-4 gap-4">
            <View className="h-28 rounded-2xl bg-surface/60 border border-line/40 p-4 gap-2" />
            <View className="h-40 rounded-2xl bg-surface/60 border border-line/40 p-4 gap-2" />
          </View>
        )}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <If
            condition={isAuthorized}
            fallback={(
              <RenderAuth
                staffMode={staffMode}
                step={step}
                phone={phone}
                code={code}
                devCode={devCode}
                errorMessage={authError}
                busy={requestCode.isPending || verifyCode.isPending}
                resendSeconds={resendSeconds}
                credentials={credentials}
                staffError={staffError}
                staffBusy={staffSignin.isPending}
                onPhoneChange={handleIdentifierChange}
                onCodeChange={setCode}
                onRequestCode={handleRequestCode}
                onVerify={handleVerify}
                onChangePhone={handleChangePhone}
                onCredentialsChange={setCredentials}
                onStaffSubmit={handleStaffSubmit}
              />
            )}
          >
            <If
              condition={!isLoading}
              fallback={(
                <View className="px-4 pt-4 gap-4">
                  <View className="h-28 rounded-2xl bg-surface/60 border border-line/40 p-4 gap-2" />
                  <View className="h-40 rounded-2xl bg-surface/60 border border-line/40 p-4 gap-2" />
                </View>
              )}
            >
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
    </View>
  );
};
