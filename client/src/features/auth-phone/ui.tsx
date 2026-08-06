import { Pressable, Text, TextInput, View } from 'react-native';
import { formatPhoneDisplay, formatPhoneMask } from '@/features/auth-phone/lib';
import {
  AuthLabels,
  AuthSteps,
  CODE_LENGTH,
  TAuthStep,
  isCodeValid,
  isPhoneValid,
} from '@/features/auth-phone/model';
import { Button, ButtonVariants, If } from '@/shared/ui';

interface IProps {
  step: TAuthStep;
  phone: string;
  code: string;
  devCode: string | null;
  errorMessage: string | null;
  busy: boolean;
  resendSeconds: number;
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
  resendSeconds,
  onPhoneChange,
  onCodeChange,
  onRequestCode,
  onVerify,
  onChangePhone,
}: IProps) => (
  <View className="gap-4 px-4 py-2">
    <View className="gap-1">
      <Text className="text-2xl font-bold text-content">{AuthLabels.title}</Text>
      <Text className="text-sm text-muted">
        {step === AuthSteps.phone
          ? AuthLabels.subtitle
          : `${AuthLabels.enterCodeSubtitle} ${formatPhoneDisplay(phone)}`}
      </Text>
    </View>

    <If
      condition={step === AuthSteps.phone}
      fallback={(
        <View className="gap-4">
          <View className="rounded-brandSm border border-emerald-500/30 bg-emerald-500/10 p-3">
            <Text className="text-center text-xs font-medium text-emerald-700">
              {AuthLabels.smsSentNotice}
            </Text>
          </View>

          <View className="relative min-h-[60px] justify-center">
            <View className="flex-row justify-center gap-3">
              {[0, 1, 2, 3].map((index) => {
                const char = code[index] ?? '';
                const isCurrent = index === Math.min(code.length, CODE_LENGTH - 1);
                const isFilled = index < code.length;

                return (
                  <View
                    key={index}
                    className={[
                      'h-14 w-14 items-center justify-center rounded-brandSm border-2',
                      isCurrent
                        ? 'border-primary bg-surface'
                        : isFilled
                          ? 'border-line bg-surface'
                          : 'border-line bg-background',
                    ].join(' ')}
                  >
                    <Text className="text-2xl font-bold text-content">{char}</Text>
                  </View>
                );
              })}
            </View>

            <TextInput
              value={code}
              onChangeText={(val) => {
                const digitsOnly = val.replace(/\D/g, '').slice(0, CODE_LENGTH);

                onCodeChange(digitsOnly);
                if (digitsOnly.length === CODE_LENGTH && !busy) {
                  onVerify();
                }
              }}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              textContentType="oneTimeCode"
              autoFocus
              editable={!busy}
              aria-label={AuthLabels.codePlaceholder}
              className="absolute inset-0 opacity-0"
            />
          </View>

          <If condition={Boolean(devCode)}>
            <View className="items-center rounded-brandSm border border-line bg-surface p-2">
              <Text className="text-xs font-medium text-muted">
                {`${AuthLabels.devCodeHint}: ${devCode}`}
              </Text>
            </View>
          </If>

          <Button
            title={AuthLabels.confirm}
            disabled={!isCodeValid(code) || busy}
            loading={busy}
            onPress={onVerify}
          />

          <Button
            title={
              resendSeconds > 0
                ? `${AuthLabels.resendIn} ${resendSeconds} ${AuthLabels.sec}`
                : AuthLabels.resend
            }
            variant={ButtonVariants.ghost}
            disabled={resendSeconds > 0 || busy}
            loading={busy && resendSeconds === 0}
            onPress={onRequestCode}
          />

          <Pressable onPress={onChangePhone} disabled={busy} className="items-center py-2">
            <Text className="text-sm font-semibold text-primary">{AuthLabels.changePhone}</Text>
          </Pressable>
        </View>
      )}
    >
      <View className="gap-3">
        <View className="relative justify-center">
          <TextInput
            value={phone}
            onChangeText={(val) => onPhoneChange(formatPhoneMask(val))}
            placeholder={AuthLabels.phonePlaceholder}
            keyboardType="phone-pad"
            editable={!busy}
            maxLength={18}
            className="h-12 rounded-brandSm border border-line bg-background pl-3 pr-10 text-content"
          />
          <If condition={phone.length > 0 && !busy}>
            <Pressable
              onPress={() => onPhoneChange('')}
              className="absolute right-3 h-6 w-6 items-center justify-center rounded-full bg-line"
            >
              <Text className="text-xs text-muted font-bold">✕</Text>
            </Pressable>
          </If>
        </View>

        <Button
          title={AuthLabels.sendCode}
          disabled={!isPhoneValid(phone) || busy}
          loading={busy}
          onPress={onRequestCode}
        />

        <Text className="px-1 text-center text-xs leading-5 text-muted">
          {AuthLabels.termsNotice}{' '}
          <Text className="text-primary font-medium">{AuthLabels.termsLink}</Text> и{' '}
          <Text className="text-primary font-medium">{AuthLabels.privacyLink}</Text>
        </Text>
      </View>
    </If>

    <If condition={Boolean(errorMessage)}>
      <View className="rounded-brandSm border border-danger/30 bg-danger/10 p-3">
        <Text className="text-sm text-danger">{errorMessage}</Text>
      </View>
    </If>
  </View>
);
