import { useRef } from 'react';
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
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';

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
}: IProps) => {
  const codeInputRef = useRef<TextInput>(null);

  return (
    <View className="gap-6 px-4 py-4">
      <View className="gap-2">
        <Text className="text-2xl font-extrabold tracking-tight text-content">
          {AuthLabels.title}
        </Text>
        <Text className="text-sm leading-5 text-muted">
          {step === AuthSteps.phone
            ? AuthLabels.subtitle
            : `${AuthLabels.enterCodeSubtitle} ${formatPhoneDisplay(phone)}`}
        </Text>
      </View>

      <If
        condition={step === AuthSteps.phone}
        fallback={(
          <View className="gap-5">
            <View className="flex-row items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5">
              <Icon name="check" size={16} color="#059669" />
              <Text className="flex-1 text-xs font-bold text-emerald-800">
                {AuthLabels.smsSentNotice}
              </Text>
            </View>

            <Pressable
              onPress={() => codeInputRef.current?.focus()}
              className="relative min-h-[72px] justify-center py-2"
            >
              <View className="flex-row justify-center gap-3">
                {[0, 1, 2, 3].map((index) => {
                  const char = code[index] ?? '';
                  const isCurrent = index === Math.min(code.length, CODE_LENGTH - 1);
                  const isFilled = index < code.length;

                  return (
                    <View
                      key={index}
                      className={[
                        'h-16 flex-1 max-w-[64px] items-center justify-center rounded-2xl border-2',
                        isCurrent && !busy
                          ? 'border-primary bg-surface/80 shadow-sm'
                          : isFilled
                            ? 'border-neutral-400 bg-surface'
                            : 'border-line bg-background',
                      ].join(' ')}
                    >
                      <Text className="text-2xl font-extrabold text-content">
                        {char}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <TextInput
                ref={codeInputRef}
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
            </Pressable>

            <If condition={Boolean(devCode)}>
              <View className="items-center rounded-2xl border border-line bg-surface/60 p-3">
                <Text className="text-xs font-semibold text-muted">
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
              <Text className="text-sm font-bold text-primary">{AuthLabels.changePhone}</Text>
            </Pressable>
          </View>
        )}
      >
        <View className="gap-4">
          <View className="relative justify-center">
            <TextInput
              value={phone}
              onChangeText={(val) => onPhoneChange(formatPhoneMask(val))}
              placeholder={AuthLabels.phonePlaceholder}
              placeholderTextColor="#a3a3a3"
              keyboardType="phone-pad"
              editable={!busy}
              maxLength={18}
              style={{ paddingVertical: 0 }}
              textAlignVertical="center"
              className="h-14 rounded-2xl border border-line bg-surface pl-4 pr-10 text-base font-bold text-content tracking-wide"
            />
            <If condition={phone.length > 0 && !busy}>
              <Pressable
                onPress={() => onPhoneChange('')}
                className="absolute right-3.5 h-7 w-7 items-center justify-center rounded-full bg-line"
              >
                <Icon name="cross" size={14} color="#737373" />
              </Pressable>
            </If>
          </View>

          <Button
            title={AuthLabels.sendCode}
            disabled={!isPhoneValid(phone) || busy}
            loading={busy}
            onPress={onRequestCode}
          />

          <Text className="px-2 text-center text-xs leading-5 text-muted">
            {AuthLabels.termsNotice}{' '}
            <Text className="font-bold text-primary">{AuthLabels.termsLink}</Text> и{' '}
            <Text className="font-bold text-primary">{AuthLabels.privacyLink}</Text>
          </Text>
        </View>
      </If>

      <If condition={Boolean(errorMessage)}>
        <View className="rounded-2xl border border-danger/40 bg-danger/10 p-3.5">
          <Text className="text-xs font-semibold text-danger">{errorMessage}</Text>
        </View>
      </If>
    </View>
  );
};
