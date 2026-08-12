import { RefObject } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { triggerHapticLight, triggerHapticSuccess } from '@/shared/lib/haptics';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import { AuthLabels, CODE_LENGTH, isCodeValid } from '@/features/auth-email/model';

interface IProps {
  code: string;
  devCode: string | null;
  delivered: boolean;
  busy: boolean;
  resendSeconds: number;
  inputRef: RefObject<TextInput | null>;
  onCodeChange: (value: string) => void;
  onVerify: (code: string) => void;
  onRequestCode: () => void;
}

const CELLS = [0, 1, 2, 3];

const cellClass = (isCurrent: boolean, isFilled: boolean, busy: boolean): string => {
  if (isCurrent && !busy) {
    return 'border-primary bg-surface shadow-sm scale-105';
  }

  return isFilled ? 'border-neutral-400 bg-surface' : 'border-line bg-background/50';
};

export const RenderCode = ({
  code,
  devCode,
  delivered,
  busy,
  resendSeconds,
  inputRef,
  onCodeChange,
  onVerify,
  onRequestCode,
}: IProps) => {
  const handleChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, CODE_LENGTH);

    triggerHapticLight();
    onCodeChange(digitsOnly);

    if (digitsOnly.length === CODE_LENGTH && !busy) {
      triggerHapticSuccess();
      onVerify(digitsOnly);
    }
  };

  const handlePaste = () => {
    if (!devCode) {
      return;
    }

    triggerHapticSuccess();
    onCodeChange(devCode);

    if (devCode.length === CODE_LENGTH && !busy) {
      onVerify(devCode);
    }
  };

  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
          <Icon name="check" size={14} color="#059669" />
        </View>
        <Text className="flex-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          {delivered ? AuthLabels.letterSentNotice : AuthLabels.letterNotSentNotice}
        </Text>
      </View>

      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="relative min-h-[72px] justify-center py-2"
      >
        <View className="flex-row justify-center gap-3">
          {CELLS.map((index) => (
            <View
              key={index}
              className={[
                'h-16 flex-1 max-w-[64px] items-center justify-center rounded-2xl border-2',
                cellClass(index === Math.min(code.length, CODE_LENGTH - 1), index < code.length, busy),
              ].join(' ')}
            >
              <Text className="text-2xl font-black text-content">{code[index] ?? ''}</Text>
            </View>
          ))}
        </View>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          textContentType="oneTimeCode"
          autoFocus
          editable={!busy}
          aria-label={AuthLabels.codeTitle}
          className="absolute inset-0 opacity-0"
        />
      </Pressable>

      <If condition={Boolean(devCode)}>
        <Pressable
          onPress={handlePaste}
          accessibilityRole="button"
          className="flex-row items-center justify-between rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 active:bg-sky-500/20"
        >
          <View className="flex-row items-center gap-2">
            <Icon name="sparkles" size={16} color="#0284c7" />
            <Text className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              {`${AuthLabels.devCodeHint}: `}
              <Text className="font-extrabold text-primary">{devCode}</Text>
            </Text>
          </View>
          <View className="rounded-lg bg-sky-500/20 px-2.5 py-1">
            <Text className="text-[11px] font-bold text-sky-900 dark:text-sky-200">
              {AuthLabels.paste}
            </Text>
          </View>
        </Pressable>
      </If>

      <Button
        title={AuthLabels.confirm}
        disabled={!isCodeValid(code) || busy}
        loading={busy}
        onPress={() => {
          triggerHapticSuccess();
          onVerify(code);
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
  );
};
