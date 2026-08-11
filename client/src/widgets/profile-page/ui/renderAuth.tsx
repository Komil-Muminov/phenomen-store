import { View } from 'react-native';
import { AuthPhone, TAuthStep } from '@/features/auth-phone';
import { AuthStaff, IStaffCredentials } from '@/features/auth-staff';

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
  onPhoneChange,
  onCodeChange,
  onRequestCode,
  onVerify,
  onChangePhone,
  onCredentialsChange,
  onStaffSubmit,
}: IProps) => {
  return (
    <View className="gap-6 px-4 pt-4 pb-8">
      {staffMode ? (
        <AuthStaff
          values={credentials}
          errorMessage={staffError}
          busy={staffBusy}
          onChange={onCredentialsChange}
          onSubmit={onStaffSubmit}
        />
      ) : (
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
    </View>
  );
};
