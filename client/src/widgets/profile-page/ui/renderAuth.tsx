import { View } from 'react-native';
import { AuthEmail, TAuthStep } from '@/features/auth-email';
import { AuthStaff, IStaffCredentials } from '@/features/auth-staff';

interface IProps {
  staffMode: boolean;
  step: TAuthStep;
  email: string;
  code: string;
  devCode: string | null;
  delivered: boolean;
  errorMessage: string | null;
  busy: boolean;
  resendSeconds: number;
  credentials: IStaffCredentials;
  staffError: string | null;
  staffBusy: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onVerify: (code: string) => void;
  onChangeEmail: () => void;
  onCredentialsChange: (values: IStaffCredentials) => void;
  onStaffSubmit: () => void;
}

export const RenderAuth = ({
  staffMode,
  step,
  email,
  code,
  devCode,
  delivered,
  errorMessage,
  busy,
  resendSeconds,
  credentials,
  staffError,
  staffBusy,
  onEmailChange,
  onCodeChange,
  onRequestCode,
  onVerify,
  onChangeEmail,
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
          onBack={onChangeEmail}
        />
      ) : (
        <AuthEmail
          step={step}
          email={email}
          code={code}
          devCode={devCode}
          delivered={delivered}
          errorMessage={errorMessage}
          busy={busy}
          resendSeconds={resendSeconds}
          onEmailChange={onEmailChange}
          onCodeChange={onCodeChange}
          onRequestCode={onRequestCode}
          onVerify={onVerify}
          onChangeEmail={onChangeEmail}
        />
      )}
    </View>
  );
};
