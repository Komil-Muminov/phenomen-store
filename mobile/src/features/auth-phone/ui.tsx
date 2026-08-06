import { Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, If } from '@/shared/ui';
import {
  AuthLabels,
  AuthSteps,
  CODE_LENGTH,
  TAuthStep,
  isCodeValid,
  isPhoneValid,
} from '@/features/auth-phone/model';

interface IProps {
  step: TAuthStep;
  phone: string;
  code: string;
  devCode: string | null;
  errorMessage: string | null;
  busy: boolean;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onVerify: () => void;
  onChangePhone: () => void;
}

export const AuthPhone = ({
  step,
  phone,
  code,
  devCode,
  errorMessage,
  busy,
  onPhoneChange,
  onCodeChange,
  onRequestCode,
  onVerify,
  onChangePhone,
}: IProps) => (
  <View className="gap-4 px-4">
    <View className="gap-1">
      <Text className="text-2xl font-bold text-content">{AuthLabels.title}</Text>
      <Text className="text-sm text-muted">{AuthLabels.subtitle}</Text>
    </View>

    <If
      condition={step === AuthSteps.phone}
      fallback={(
        <View className="gap-3">
          <Text className="text-sm text-content">{phone}</Text>
          <TextInput
            value={code}
            onChangeText={onCodeChange}
            placeholder={AuthLabels.codePlaceholder}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            className="h-12 rounded-brandSm border border-line bg-background px-3 text-content"
          />
          <If condition={Boolean(devCode)}>
            <Text className="text-xs text-muted">{`${AuthLabels.devCodeHint}: ${devCode}`}</Text>
          </If>
          <Button
            title={AuthLabels.confirm}
            disabled={!isCodeValid(code)}
            loading={busy}
            onPress={onVerify}
          />
          <Button
            title={AuthLabels.resend}
            variant={ButtonVariants.ghost}
            loading={busy}
            onPress={onRequestCode}
          />
          <Button
            title={AuthLabels.changePhone}
            variant={ButtonVariants.secondary}
            onPress={onChangePhone}
          />
        </View>
      )}
    >
      <View className="gap-3">
        <TextInput
          value={phone}
          onChangeText={onPhoneChange}
          placeholder={AuthLabels.phonePlaceholder}
          keyboardType="phone-pad"
          className="h-12 rounded-brandSm border border-line bg-background px-3 text-content"
        />
        <Button
          title={AuthLabels.sendCode}
          disabled={!isPhoneValid(phone)}
          loading={busy}
          onPress={onRequestCode}
        />
      </View>
    </If>

    <If condition={Boolean(errorMessage)}>
      <Text className="text-sm text-danger">{errorMessage}</Text>
    </If>
  </View>
);
