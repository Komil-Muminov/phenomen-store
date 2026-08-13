import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IOrder } from '@/entities/order';
import { AuthSteps, RESEND_DELAY_SEC, TAuthStep } from '@/features/auth-email';
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
import {
  EMPTY_PROFILE,
  IProfileValues,
  ProfileForm,
  formatPhoneMask,
  toProfilePayload,
} from '@/features/profile-form';
import {
  EmailChange,
  EmailChangeSteps,
  TEmailChangeStep,
} from '@/features/email-change';

interface IProfile {
  id: string;
  phone: string | null;
  lastName: string | null;
  profileComplete: boolean;
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
  const [step, setStep] = useState<TAuthStep>(AuthSteps.email);
  const [email, setEmail] = useState('');
  const [delivered, setDelivered] = useState(false);
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [values, setValues] = useState<IProfileValues>(EMPTY_PROFILE);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<TEmailChangeStep>(EmailChangeSteps.email);
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailDevCode, setEmailDevCode] = useState<string | null>(null);
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [resendSeconds, setResendSeconds] = useState(0);

  const [staffMode, setStaffMode] = useState(false);

  const handleIdentifierChange = useCallback((value: string) => {
    setAuthError(null);
    setStaffError(null);
    setEmail(value);
    setCredentials((current) => ({ ...current, login: value.trim() }));
  }, []);

  const handleBackToIdentifier = useCallback(() => {
    setStaffMode(false);
    setStaffError(null);
    setAuthError(null);
    setStep(AuthSteps.email);
    setCode('');
    setDevCode(null);
    setResendSeconds(0);
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
  const requestCode = useMutationQuery<
    { email: string },
    { code: string | null; delivered: boolean }
  >(ApiRoutes.authCode);
  const verifyCode = useMutationQuery<
    { email: string; code: string },
    { token: string }
  >(ApiRoutes.authVerify);
  const saveProfile = useMutationQuery<
    { name: string; lastName: string; phone: string },
    IProfile
  >(ApiRoutes.authUpdate, { method: 'patch', invalidate: [[QueryKeys.profile]] });
  const emailCodeMutation = useMutationQuery<
    { email: string },
    { code: string | null; delivered: boolean }
  >(ApiRoutes.authEmailCode);
  const emailUpdateMutation = useMutationQuery<{ email: string; code: string }, IProfile>(
    ApiRoutes.authEmailUpdate,
    { method: 'patch', invalidate: [[QueryKeys.profile]] },
  );
  const cancelOrder = useMutationQuery<{ id: string }, IOrder>(
    (body) => `${ApiRoutes.ordersCancel}/${body.id}`,
    { invalidate: [[QueryKeys.orders]] },
  );

  useEffect(() => {
    setValues({
      name: profile?.name ?? '',
      lastName: profile?.lastName ?? '',
      phone: formatPhoneMask(profile?.phone ?? ''),
    });
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
            setEmail('');
            setStaffMode(false);
            router.replace(toHref(AppRoutes.admin));
          });
        },
        onError: (error) => setStaffError(error.message),
      },
    );
  }, [staffSignin, credentials, staffSignIn, router]);

  const handleRequestCode = useCallback(() => {
    setAuthError(null);

    if (isStaffIdentifier(email)) {
      setStaffMode(true);

      return;
    }

    requestCode.mutate({ email }, {
      onSuccess: (data) => {
        setDevCode(data.code);
        setDelivered(data.delivered);
        setStep(AuthSteps.code);
        setResendSeconds(RESEND_DELAY_SEC);
      },
      onError: (error) => setAuthError(error.message),
    });
  }, [email, requestCode]);



  const handleVerify = useCallback((entered: string) => {
    setAuthError(null);
    verifyCode.mutate({ email, code: entered }, {
      onSuccess: async (data) => {
        await login(data.token);
        setCode('');
        setDevCode(null);
        setStep(AuthSteps.email);
      },
      onError: (error) => setAuthError(error.message),
    });
  }, [login, email, verifyCode]);

  const handleSaveProfile = useCallback(() => {
    setProfileError(null);
    saveProfile.mutate(toProfilePayload(values), {
      onError: (error) => setProfileError(error.message),
    });
  }, [saveProfile, values]);

  const handleOpenEmailForm = useCallback(() => {
    setEmailFormOpen(true);
    setEmailStep(EmailChangeSteps.email);
    setNewEmail('');
    setEmailCode('');
    setEmailDevCode(null);
    setEmailError(null);
  }, []);

  const handleRequestEmailCode = useCallback(() => {
    setEmailError(null);
    emailCodeMutation.mutate({ email: newEmail }, {
      onSuccess: (data) => {
        setEmailDevCode(data.code);
        setEmailDelivered(data.delivered);
        setEmailStep(EmailChangeSteps.code);
      },
      onError: (error) => setEmailError(error.message),
    });
  }, [emailCodeMutation, newEmail]);

  const handleConfirmEmail = useCallback(() => {
    setEmailError(null);
    emailUpdateMutation.mutate({ email: newEmail, code: emailCode }, {
      onSuccess: () => setEmailFormOpen(false),
      onError: (error) => setEmailError(error.message),
    });
  }, [emailUpdateMutation, newEmail, emailCode]);

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
                email={email}
                delivered={delivered}
                code={code}
                devCode={devCode}
                errorMessage={authError}
                busy={requestCode.isPending || verifyCode.isPending}
                resendSeconds={resendSeconds}
                credentials={credentials}
                staffError={staffError}
                staffBusy={staffSignin.isPending}
                onEmailChange={handleIdentifierChange}
                onCodeChange={setCode}
                onRequestCode={handleRequestCode}
                onVerify={handleVerify}
                onChangeEmail={handleBackToIdentifier}
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
              <If
                condition={profile?.profileComplete !== false}
                fallback={(
                  <View className="px-4 pb-10 pt-4">
                    <ProfileForm
                      values={values}
                      welcome
                      busy={saveProfile.isPending}
                      errorMessage={profileError}
                      onChange={setValues}
                      onSubmit={handleSaveProfile}
                    />
                  </View>
                )}
              >
                <ProfileOrders
                  email={profile?.email ?? null}
                  values={values}
                  orders={orders?.items ?? []}
                  savingProfile={saveProfile.isPending}
                  profileError={profileError}
                  cancellingId={cancellingId}
                  onChange={setValues}
                  onSave={handleSaveProfile}
                  onChangeEmail={handleOpenEmailForm}
                  onOpenSupport={() => router.push(toHref(AppRoutes.support))}
                  onCancelOrder={handleCancelOrder}
                  onLogout={logout}
                />
              </If>
            </If>
          </If>
        </ScrollView>
      </If>
      <BottomBar />

      <EmailChange
        open={emailFormOpen}
        step={emailStep}
        email={newEmail}
        code={emailCode}
        devCode={emailDevCode}
        delivered={emailDelivered}
        errorMessage={emailError}
        busy={emailCodeMutation.isPending || emailUpdateMutation.isPending}
        onEmailChange={setNewEmail}
        onCodeChange={setEmailCode}
        onRequestCode={handleRequestEmailCode}
        onConfirm={handleConfirmEmail}
        onClose={() => setEmailFormOpen(false)}
      />
    </View>
  );
};
