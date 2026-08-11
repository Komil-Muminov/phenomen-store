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
import { isStaffIdentifier } from '@/features/auth-staff';
import { triggerHapticLight, triggerHapticSuccess } from '@/shared/lib/haptics';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';

const IDENTIFIER_MAX_LENGTH = 64;

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

  const handleDevCodeAutoFill = () => {
    if (!devCode) return;
    triggerHapticSuccess();
    onCodeChange(devCode);
    if (devCode.length === CODE_LENGTH && !busy) {
      onVerify();
    }
  };

  const handleClearPhone = () => {
    triggerHapticLight();
    onPhoneChange('');
  };

  const handleChangePhoneWithHaptics = () => {
    triggerHapticLight();
    onChangePhone();
  };

  return (
    <View className="gap-5 px-4 py-3">
      <If condition={step === AuthSteps.code}>
        <Pressable
          onPress={handleChangePhoneWithHaptics}
          disabled={busy}
          className="flex-row items-center gap-2 self-start rounded-full bg-surface px-3 py-1.5 border border-line/60 active:bg-surface/80"
        >
          <Icon name="arrow-left" size={16} color="#0284c7" />
          <Text className="text-xs font-bold text-primary">Изменить номер</Text>
        </Pressable>
      </If>

      <View className="gap-1">
        <Text className="text-xl font-extrabold tracking-tight text-content">
          {step === AuthSteps.phone ? 'Вход или регистрация' : 'Введите SMS-код'}
        </Text>
        <Text className="text-xs leading-5 text-muted">
          {step === AuthSteps.phone
            ? AuthLabels.subtitle
            : `${AuthLabels.enterCodeSubtitle} ${formatPhoneDisplay(phone)}`}
        </Text>
      </View>

      <If
        condition={step === AuthSteps.phone}
        fallback={(
          <View className="gap-5">
            <View className="flex-row items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                <Icon name="check" size={14} color="#059669" />
              </View>
              <Text className="flex-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
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
                        'h-16 flex-1 max-w-[64px] items-center justify-center rounded-2xl border-2 transition-all',
                        isCurrent && !busy
                          ? 'border-primary bg-surface shadow-sm scale-105'
                          : isFilled
                            ? 'border-neutral-400 bg-surface'
                            : 'border-line bg-background/50',
                      ].join(' ')}
                    >
                      <Text className="text-2xl font-black text-content">
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

                  triggerHapticLight();
                  onCodeChange(digitsOnly);
                  if (digitsOnly.length === CODE_LENGTH && !busy) {
                    triggerHapticSuccess();
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
              <Pressable
                onPress={handleDevCodeAutoFill}
                className="flex-row items-center justify-between rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 active:bg-sky-500/20"
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="sparkles" size={16} color="#0284c7" />
                  <Text className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                    {`Тестовый код: `}
                    <Text className="font-extrabold text-primary">{devCode}</Text>
                  </Text>
                </View>
                <View className="rounded-lg bg-sky-500/20 px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-sky-900 dark:text-sky-200">Вставить</Text>
                </View>
              </Pressable>
            </If>

            <Button
              title={AuthLabels.confirm}
              disabled={!isCodeValid(code) || busy}
              loading={busy}
              onPress={() => {
                triggerHapticSuccess();
                onVerify();
              }}
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
              onPress={() => {
                triggerHapticLight();
                onRequestCode();
              }}
            />
          </View>
        )}
      >
        <View className="gap-4">
          <View className="relative justify-center">
            <TextInput
              value={phone}
              onChangeText={(val) => onPhoneChange(
                isStaffIdentifier(val) ? val.trim() : formatPhoneMask(val),
              )}
              placeholder={AuthLabels.phonePlaceholder}
              placeholderTextColor="#a3a3a3"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!busy}
              maxLength={IDENTIFIER_MAX_LENGTH}
              style={{ paddingVertical: 0 }}
              textAlignVertical="center"
              className="h-14 rounded-2xl border border-line bg-surface pl-4 pr-10 text-base font-bold text-content tracking-wide"
            />
            <If condition={phone.length > 0 && !busy}>
              <Pressable
                onPress={handleClearPhone}
                className="absolute right-3.5 h-7 w-7 items-center justify-center rounded-full bg-line active:bg-neutral-300"
              >
                <Icon name="cross" size={14} color="#737373" />
              </Pressable>
            </If>
          </View>

          <Button
            title={AuthLabels.sendCode}
            disabled={!isPhoneValid(phone) || busy}
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
