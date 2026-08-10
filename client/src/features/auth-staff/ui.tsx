import { Text, TextInput, View } from 'react-native';
import { StaffTexts } from '@/shared/config';
import { Button, ButtonSizes, If } from '@/shared/ui';
import { IStaffCredentials, isCredentialsValid } from '@/features/auth-staff/model';

interface IProps {
  values: IStaffCredentials;
  errorMessage: string | null;
  busy: boolean;
  onChange: (values: IStaffCredentials) => void;
  onSubmit: () => void;
}

const FIELD_CLASS = 'h-12 rounded-2xl border border-line bg-surface px-4 text-base text-content';

export const AuthStaff = ({ values, errorMessage, busy, onChange, onSubmit }: IProps) => (
  <View className="gap-5 px-4 py-4">
    <View className="gap-2">
      <Text className="text-2xl font-extrabold tracking-tight text-content">
        {StaffTexts.title}
      </Text>
      <Text className="text-sm leading-5 text-muted">{StaffTexts.subtitle}</Text>
    </View>

    <View className="gap-3">
      <View className="gap-1.5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          {StaffTexts.loginLabel}
        </Text>
        <TextInput
          value={values.login}
          placeholder={StaffTexts.loginPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={(login) => onChange({ ...values, login })}
          className={FIELD_CLASS}
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          {StaffTexts.passwordLabel}
        </Text>
        <TextInput
          value={values.password}
          placeholder={StaffTexts.passwordPlaceholder}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={(password) => onChange({ ...values, password })}
          onSubmitEditing={onSubmit}
          returnKeyType="go"
          className={FIELD_CLASS}
        />
      </View>
    </View>

    <If condition={Boolean(errorMessage)}>
      <Text className="text-sm font-medium text-danger">{errorMessage}</Text>
    </If>

    <Button
      title={StaffTexts.submit}
      size={ButtonSizes.large}
      loading={busy}
      disabled={!isCredentialsValid(values)}
      onPress={onSubmit}
    />
  </View>
);
