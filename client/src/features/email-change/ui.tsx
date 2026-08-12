import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { triggerHapticLight } from '@/shared/lib/haptics';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import {
  CODE_LENGTH,
  EmailChangeSteps,
  EmailChangeTexts,
  TEmailChangeStep,
  isCodeValid,
  isEmailValid,
} from '@/features/email-change/model';

interface IProps {
  open: boolean;
  step: TEmailChangeStep;
  email: string;
  code: string;
  devCode: string | null;
  delivered: boolean;
  errorMessage: string | null;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRequestCode: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

const FIELD = 'h-14 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const EmailChange = ({
  open,
  step,
  email,
  code,
  devCode,
  delivered,
  errorMessage,
  busy,
  onEmailChange,
  onCodeChange,
  onRequestCode,
  onConfirm,
  onClose,
}: IProps) => {
  const isCodeStep = step === EmailChangeSteps.code;

  const handleClose = () => {
    triggerHapticLight();
    onClose();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="gap-5 rounded-t-3xl bg-background px-4 pb-10 pt-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-xl font-extrabold tracking-tight text-content">
                {EmailChangeTexts.title}
              </Text>
              <Text className="text-xs leading-5 text-muted">
                {isCodeStep
                  ? `${EmailChangeTexts.codeSubtitle} ${email}`
                  : EmailChangeTexts.emailSubtitle}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={EmailChangeTexts.cancel}
              className="h-9 w-9 items-center justify-center rounded-full bg-surface active:opacity-80"
            >
              <Icon name="close" size={16} />
            </Pressable>
          </View>

          <If
            condition={isCodeStep}
            fallback={(
              <View className="gap-1.5">
                <Text className={LABEL}>{EmailChangeTexts.emailLabel}</Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => onEmailChange(value.trim().toLowerCase())}
                  placeholder={EmailChangeTexts.emailPlaceholder}
                  placeholderTextColor="#a3a3a3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!busy}
                  autoFocus
                  style={{ paddingVertical: 0 }}
                  textAlignVertical="center"
                  className={FIELD}
                />
              </View>
            )}
          >
            <View className="gap-3">
              <If condition={!delivered}>
                <View className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-3.5">
                  <Text className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                    {`${EmailChangeTexts.notDelivered} ${devCode ?? ''}`}
                  </Text>
                </View>
              </If>

              <View className="gap-1.5">
                <Text className={LABEL}>{EmailChangeTexts.codeLabel}</Text>
                <TextInput
                  value={code}
                  onChangeText={(value) => onCodeChange(value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                  placeholder={EmailChangeTexts.codePlaceholder}
                  placeholderTextColor="#a3a3a3"
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                  editable={!busy}
                  autoFocus
                  style={{ paddingVertical: 0 }}
                  textAlignVertical="center"
                  className={`${FIELD} tracking-[8px]`}
                />
              </View>
            </View>
          </If>

          <If condition={Boolean(errorMessage)}>
            <View className="rounded-2xl border border-danger/40 bg-danger/10 p-3.5">
              <Text className="text-xs font-semibold text-danger">{errorMessage}</Text>
            </View>
          </If>

          <View className="gap-2">
            <Button
              title={isCodeStep ? EmailChangeTexts.confirm : EmailChangeTexts.sendCode}
              disabled={busy || (isCodeStep ? !isCodeValid(code) : !isEmailValid(email))}
              loading={busy}
              onPress={isCodeStep ? onConfirm : onRequestCode}
            />

            <Button
              title={EmailChangeTexts.cancel}
              variant={ButtonVariants.ghost}
              disabled={busy}
              onPress={handleClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
