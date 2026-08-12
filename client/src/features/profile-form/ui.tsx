import { Text, TextInput, View } from 'react-native';
import { triggerHapticSuccess } from '@/shared/lib/haptics';
import { Button, If } from '@/shared/ui';
import {
  IProfileValues,
  ProfileFormTexts,
  formatPhoneMask,
  isProfileValid,
} from '@/features/profile-form/model';

interface IProps {
  values: IProfileValues;
  welcome: boolean;
  busy: boolean;
  errorMessage: string | null;
  onChange: (values: IProfileValues) => void;
  onSubmit: () => void;
}

const FIELD = 'h-14 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const ProfileForm = ({
  values,
  welcome,
  busy,
  errorMessage,
  onChange,
  onSubmit,
}: IProps) => {
  const handleSubmit = () => {
    triggerHapticSuccess();
    onSubmit();
  };

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-xl font-extrabold tracking-tight text-content">
          {welcome ? ProfileFormTexts.welcomeTitle : ProfileFormTexts.editTitle}
        </Text>
        <If condition={welcome}>
          <Text className="text-xs leading-5 text-muted">{ProfileFormTexts.welcomeSubtitle}</Text>
        </If>
      </View>

      <View className="gap-4">
        <View className="gap-1.5">
          <Text className={LABEL}>{ProfileFormTexts.nameLabel}</Text>
          <TextInput
            value={values.name}
            onChangeText={(name) => onChange({ ...values, name })}
            placeholder={ProfileFormTexts.namePlaceholder}
            placeholderTextColor="#a3a3a3"
            editable={!busy}
            style={{ paddingVertical: 0 }}
            textAlignVertical="center"
            className={FIELD}
          />
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{ProfileFormTexts.lastNameLabel}</Text>
          <TextInput
            value={values.lastName}
            onChangeText={(lastName) => onChange({ ...values, lastName })}
            placeholder={ProfileFormTexts.lastNamePlaceholder}
            placeholderTextColor="#a3a3a3"
            editable={!busy}
            style={{ paddingVertical: 0 }}
            textAlignVertical="center"
            className={FIELD}
          />
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{ProfileFormTexts.phoneLabel}</Text>
          <TextInput
            value={values.phone}
            onChangeText={(phone) => onChange({ ...values, phone: formatPhoneMask(phone) })}
            placeholder={ProfileFormTexts.phonePlaceholder}
            placeholderTextColor="#a3a3a3"
            keyboardType="phone-pad"
            editable={!busy}
            maxLength={18}
            style={{ paddingVertical: 0 }}
            textAlignVertical="center"
            className={FIELD}
          />
        </View>
      </View>

      <If condition={Boolean(errorMessage)}>
        <View className="rounded-2xl border border-danger/40 bg-danger/10 p-3.5">
          <Text className="text-xs font-semibold text-danger">{errorMessage}</Text>
        </View>
      </If>

      <Button
        title={ProfileFormTexts.submit}
        disabled={!isProfileValid(values) || busy}
        loading={busy}
        onPress={handleSubmit}
      />
    </View>
  );
};
