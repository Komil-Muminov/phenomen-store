import { Pressable, Text, View } from 'react-native';
import { AuthPhone, TAuthStep } from '@/features/auth-phone';
import { AuthStaff, IStaffCredentials } from '@/features/auth-staff';
import { triggerHapticLight } from '@/shared/lib/haptics';
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
}: IProps) => {
  const handleSelectMode = (modeIsStaff: boolean) => {
    if (staffMode !== modeIsStaff) {
      triggerHapticLight();
      onToggleMode();
    }
  };

  return (
    <View className="gap-6 px-4 pt-4 pb-8">
      {/* Sleek Segmented Switcher Pill */}
      <View className="flex-row rounded-full bg-surface p-1 border border-line/50">
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: !staffMode }}
          onPress={() => handleSelectMode(false)}
          className={[
            'flex-1 items-center justify-center rounded-full py-2.5 transition-all',
            !staffMode ? 'bg-background shadow-sm border border-line/40' : 'bg-transparent',
          ].join(' ')}
        >
          <Text className={['text-xs font-bold', !staffMode ? 'text-content' : 'text-muted'].join(' ')}>
            Покупатель
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: staffMode }}
          onPress={() => handleSelectMode(true)}
          className={[
            'flex-1 items-center justify-center rounded-full py-2.5 transition-all',
            staffMode ? 'bg-background shadow-sm border border-line/40' : 'bg-transparent',
          ].join(' ')}
        >
          <Text className={['text-xs font-bold', staffMode ? 'text-content' : 'text-muted'].join(' ')}>
            Сотрудник
          </Text>
        </Pressable>
      </View>

      {/* Main Form Content */}
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
    </View>
  );
};
