import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, If } from '@/shared/ui';
import { PasswordTexts, isPasswordValid } from '@/widgets/admin-settings/model';

interface IProps {
  busy: boolean;
  message: string | null;
  errorMessage: string | null;
  onSubmit: (currentPassword: string, newPassword: string) => void;
}

const FIELD = 'h-13 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const RenderPassword = ({ busy, message, errorMessage, onSubmit }: IProps) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');

  const mismatch = repeat.length > 0 && next !== repeat;
  const ready = isPasswordValid(current, next) && next === repeat;

  return (
    <View className="gap-4 rounded-2xl border border-line bg-surface/60 p-4">
      <View className="gap-1">
        <Text className="text-sm font-bold text-content">{PasswordTexts.title}</Text>
        <Text className="text-xs leading-5 text-muted">{PasswordTexts.subtitle}</Text>
      </View>

      <View className="gap-1.5">
        <Text className={LABEL}>{PasswordTexts.current}</Text>
        <TextInput
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoComplete="off"
          editable={!busy}
          style={{ paddingVertical: 0 }}
          textAlignVertical="center"
          className={FIELD}
        />
      </View>

      <View className="gap-1.5">
        <Text className={LABEL}>{PasswordTexts.next}</Text>
        <TextInput
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoComplete="off"
          editable={!busy}
          style={{ paddingVertical: 0 }}
          textAlignVertical="center"
          className={FIELD}
        />
        <Text className="text-xs text-muted">{PasswordTexts.hint}</Text>
      </View>

      <View className="gap-1.5">
        <Text className={LABEL}>{PasswordTexts.repeat}</Text>
        <TextInput
          value={repeat}
          onChangeText={setRepeat}
          secureTextEntry
          autoComplete="off"
          editable={!busy}
          style={{ paddingVertical: 0 }}
          textAlignVertical="center"
          className={FIELD}
        />
        <If condition={mismatch}>
          <Text className="text-xs font-semibold text-danger">{PasswordTexts.mismatch}</Text>
        </If>
      </View>

      <If condition={Boolean(message)}>
        <Text className="text-sm font-semibold text-success">{message}</Text>
      </If>

      <If condition={Boolean(errorMessage)}>
        <Text className="text-sm font-medium text-danger">{errorMessage}</Text>
      </If>

      <Button
        title={PasswordTexts.submit}
        variant={ButtonVariants.secondary}
        loading={busy}
        disabled={!ready || busy}
        onPress={() => {
          onSubmit(current, next);
          setCurrent('');
          setNext('');
          setRepeat('');
        }}
      />
    </View>
  );
};
