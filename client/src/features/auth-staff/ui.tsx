import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { StaffTexts } from '@/shared/config';
import { triggerHapticLight, triggerHapticSuccess } from '@/shared/lib/haptics';
import { Button, ButtonSizes, Icon, If } from '@/shared/ui';
import { IStaffCredentials, isCredentialsValid } from '@/features/auth-staff/model';

interface IProps {
  values: IStaffCredentials;
  errorMessage: string | null;
  busy: boolean;
  onChange: (values: IStaffCredentials) => void;
  onSubmit: () => void;
}

export const AuthStaff = ({ values, errorMessage, busy, onChange, onSubmit }: IProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleShowPassword = () => {
    triggerHapticLight();
    setShowPassword((prev) => !prev);
  };

  const handleSubmitWithHaptics = () => {
    triggerHapticSuccess();
    onSubmit();
  };

  return (
    <View className="gap-5 px-1 py-1">
      {/* Header */}
      <View className="gap-1">
        <Text className="text-xl font-extrabold tracking-tight text-content">
          {StaffTexts.title}
        </Text>
        <Text className="text-xs leading-5 text-muted">{StaffTexts.subtitle}</Text>
      </View>

      {/* Inputs Container */}
      <View className="gap-4">
        {/* Login Label & Input */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            {StaffTexts.loginLabel}
          </Text>
          <View className="relative justify-center">
            <View className="absolute left-3.5 z-10">
              <Icon name="user" size={18} color="#64748b" />
            </View>
            <TextInput
              autoFocus
              value={values.login}
              placeholder={StaffTexts.loginPlaceholder}
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!busy}
              onChangeText={(login) => onChange({ ...values, login })}
              style={{ paddingVertical: 0, textAlignVertical: 'center' }}
              className="h-14 rounded-2xl border border-line bg-surface pl-11 pr-4 text-base font-semibold text-content"
            />
          </View>
        </View>

        {/* Password Label & Input */}
        <View className="gap-1.5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            {StaffTexts.passwordLabel}
          </Text>
          <View className="relative justify-center">
            <View className="absolute left-3.5 z-10">
              <Icon name="lock" size={18} color="#64748b" />
            </View>
            <TextInput
              value={values.password}
              placeholder={StaffTexts.passwordPlaceholder}
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!busy}
              onChangeText={(password) => onChange({ ...values, password })}
              onSubmitEditing={handleSubmitWithHaptics}
              returnKeyType="go"
              style={{ paddingVertical: 0, textAlignVertical: 'center' }}
              className="h-14 rounded-2xl border border-line bg-surface pl-11 pr-12 text-base font-semibold text-content"
            />
            <Pressable
              onPress={handleToggleShowPassword}
              className="absolute right-3.5 z-10 p-1"
              accessibilityLabel="Показать или скрыть пароль"
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Error Message */}
      <If condition={Boolean(errorMessage)}>
        <View className="rounded-2xl border border-danger/40 bg-danger/10 p-3.5">
          <Text className="text-xs font-semibold text-danger">{errorMessage}</Text>
        </View>
      </If>

      {/* Submit Button */}
      <Button
        title={StaffTexts.submit}
        size={ButtonSizes.large}
        loading={busy}
        disabled={!isCredentialsValid(values) || busy}
        onPress={handleSubmitWithHaptics}
      />
    </View>
  );
};
