import { Pressable, Text, View } from 'react-native';
import { AuthPhone, TAuthStep } from '@/features/auth-phone';
import { AuthStaff, IStaffCredentials } from '@/features/auth-staff';
import { StaffTexts } from '@/shared/config';
import { If } from '@/shared/ui';

interface IProps {
  staffMode: boolean;
  step: TAuthStep;
  phone: string;
  code: string;
  devCode: string | null;
  errorMessage: string | null;
  busy: boolean;
  resendSeconds: number;
  credentials: IStaffCredentials;
  staffError: string | null;
  staffBusy: boolean;
  onToggleMode: () => void;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onVerify: () => void;
  onChangePhone: () => void;
  onCredentialsChange: (values: IStaffCredentials) => void;
  onStaffSubmit: () => void;
}

export const RenderAuth = ({
  staffMode,
  step,
  phone,
  code,
  devCode,
  errorMessage,
  busy,
  resendSeconds,
  credentials,
  staffError,
  staffBusy,
  onToggleMode,
  onPhoneChange,
  onCodeChange,
  onRequestCode,
  onVerify,
  onChangePhone,
  onCredentialsChange,
  onStaffSubmit,
}: IProps) => (
  <View className="gap-2">
    <If
      condition={staffMode}
      fallback={(
        <AuthPhone
          step={step}
          phone={phone}
          code={code}
          devCode={devCode}
          errorMessage={errorMessage}
          busy={busy}
          resendSeconds={resendSeconds}
          onPhoneChange={onPhoneChange}
          onCodeChange={onCodeChange}
          onRequestCode={onRequestCode}
          onVerify={onVerify}
          onChangePhone={onChangePhone}
        />
      )}
    >
      <AuthStaff
        values={credentials}
        errorMessage={staffError}
        busy={staffBusy}
        onChange={onCredentialsChange}
        onSubmit={onStaffSubmit}
      />
    </If>

    <View className="items-center px-4 pb-6">
      <Pressable
        accessibilityRole="button"
        onPress={onToggleMode}
        className="rounded-2xl px-4 py-3 active:bg-surface"
      >
        <Text className="text-sm font-semibold text-primary">
          {staffMode ? StaffTexts.switchToCustomer : StaffTexts.switchToStaff}
        </Text>
      </Pressable>
    </View>
  </View>
);
