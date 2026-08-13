import { Modal, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants } from '@/shared/ui';
import { SUBJECT_MAX, SupportTexts, TEXT_MAX, isNewValid } from '@/widgets/support-page/model';

interface IProps {
  open: boolean;
  subject: string;
  text: string;
  busy: boolean;
  onSubject: (value: string) => void;
  onText: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const RenderNew = ({
  open,
  subject,
  text,
  busy,
  onSubject,
  onText,
  onSubmit,
  onClose,
}: IProps) => (
  <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/40">
      <View className="gap-4 rounded-t-3xl bg-background px-4 pb-10 pt-5">
        <Text className="text-xl font-extrabold tracking-tight text-content">
          {SupportTexts.newTitle}
        </Text>

        <View className="gap-1.5">
          <Text className={LABEL}>{SupportTexts.subject}</Text>
          <TextInput
            value={subject}
            onChangeText={onSubject}
            placeholder={SupportTexts.subjectPlaceholder}
            placeholderTextColor="#a3a3a3"
            maxLength={SUBJECT_MAX}
            editable={!busy}
            className="h-14 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-content"
          />
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{SupportTexts.text}</Text>
          <TextInput
            value={text}
            onChangeText={onText}
            placeholder={SupportTexts.textPlaceholder}
            placeholderTextColor="#a3a3a3"
            multiline
            maxLength={TEXT_MAX}
            editable={!busy}
            className="min-h-28 rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content"
          />
        </View>

        <View className="gap-2">
          <Button
            title={SupportTexts.send}
            loading={busy}
            disabled={!isNewValid(subject, text) || busy}
            onPress={onSubmit}
          />
          <Button title="Отмена" variant={ButtonVariants.ghost} disabled={busy} onPress={onClose} />
        </View>
      </View>
    </View>
  </Modal>
);
