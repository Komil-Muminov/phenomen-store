import { useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { isStaffIdentifier } from '@/features/auth-staff';
import { triggerHapticLight } from '@/shared/lib/haptics';
import { Button, Icon, If } from '@/shared/ui';
import {
  AuthLabels,
  AuthSteps,
  EMAIL_MAX_LENGTH,
  TAuthStep,
  isEmailValid,
} from '@/features/auth-email/model';
import { RenderCode } from '@/features/auth-email/ui/renderCode';

interface IProps {
  step: TAuthStep;
  email: string;
  code: string;
  devCode: string | null;
  delivered: boolean;
  errorMessage: string | null;
  busy: boolean;
  resendSeconds: number;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onVerify: (code: string) => void;
  onChangeEmail: () => void;
}

export const AuthEmail = ({
  step,
  email,
  code,
  devCode,
  delivered,
  errorMessage,
  busy,
  resendSeconds,
  onEmailChange,
  onCodeChange,
  onRequestCode,
  onVerify,
  onChangeEmail,
}: IProps) => {
  const codeInputRef = useRef<TextInput>(null);

  const handleChangeEmail = () => {
    triggerHapticLight();
    onChangeEmail();
  };

  const isReady = isStaffIdentifier(email) || isEmailValid(email);

  const handleClear = () => {
    triggerHapticLight();
    onEmailChange('');
  };

  return (
    <View className="gap-5 px-4 py-3">
      <If condition={step === AuthSteps.code}>
        <Pressable
          onPress={handleChangeEmail}
          disabled={busy}
          accessibilityRole="button"
          className="flex-row items-center gap-2 self-start rounded-full border border-line/60 bg-surface px-3 py-1.5 active:bg-surface/80"
        >
          <Icon name="arrow-left" size={16} color="#0284c7" />
          <Text className="text-xs font-bold text-primary">{AuthLabels.changeEmail}</Text>
        </Pressable>
      </If>

      <View className="gap-1">
        <Text className="text-xl font-extrabold tracking-tight text-content">
          {step === AuthSteps.email ? AuthLabels.title : AuthLabels.codeTitle}
        </Text>
        <Text className="text-xs leading-5 text-muted">
          {step === AuthSteps.email
            ? AuthLabels.subtitle
            : `${AuthLabels.enterCodeSubtitle} ${email}`}
        </Text>
      </View>

      <If
        condition={step === AuthSteps.email}
        fallback={(
          <RenderCode
            code={code}
            devCode={devCode}
            delivered={delivered}
            busy={busy}
            resendSeconds={resendSeconds}
            inputRef={codeInputRef}
            onCodeChange={onCodeChange}
            onVerify={onVerify}
            onRequestCode={onRequestCode}
          />
        )}
      >
        <View className="gap-4">
          <View className="relative justify-center">
            <TextInput
              value={email}
              onChangeText={onEmailChange}
              placeholder={AuthLabels.emailPlaceholder}
              placeholderTextColor="#a3a3a3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!busy}
              maxLength={EMAIL_MAX_LENGTH}
              style={{ paddingVertical: 0 }}
              textAlignVertical="center"
              className="h-14 rounded-2xl border border-line bg-surface pl-4 pr-10 text-base font-bold text-content"
            />
            <If condition={email.length > 0 && !busy}>
              <Pressable
                onPress={handleClear}
                accessibilityRole="button"
                accessibilityLabel="Очистить"
                className="absolute right-3.5 h-7 w-7 items-center justify-center rounded-full bg-line active:bg-neutral-300"
              >
                <Icon name="cross" size={14} color="#737373" />
              </Pressable>
            </If>
          </View>

          <Button
            title={AuthLabels.sendCode}
            disabled={!isReady || busy}
            loading={busy}
            onPress={() => {
              triggerHapticLight();
              onRequestCode();
            }}
          />

          <Text className="px-2 text-center text-xs leading-5 text-muted">
            {AuthLabels.termsNotice}{' '}
            <Text className="font-bold text-primary">{AuthLabels.termsLink}</Text> и{' '}
            <Text className="font-bold text-primary">{AuthLabels.privacyLink}</Text>
          </Text>
        </View>
      </If>

      <If condition={Boolean(errorMessage)}>
        <View className="flex-row items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-3.5">
          <Text className="text-xs font-semibold text-danger">{errorMessage}</Text>
        </View>
      </If>
    </View>
  );
};
