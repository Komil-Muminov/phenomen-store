import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiRoutes, AppRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { toHref } from '@/shared/lib';
import { Button, Icon, If, ImageField, Screen } from '@/shared/ui';
import {
  ISettingsValues,
  ITenantConfig,
  PasswordTexts,
  SettingsTexts,
  toSettingsPatch,
  toSettingsValues,
} from '@/widgets/admin-settings/model';
import { RenderColors } from '@/widgets/admin-settings/ui/renderColors';
import { RenderFields } from '@/widgets/admin-settings/ui/renderFields';
import { RenderPassword } from '@/widgets/admin-settings/ui/renderPassword';

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const AdminSettings = () => {
  const router = useRouter();
  const [values, setValues] = useState<ISettingsValues | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const configQuery = useGetQuery<ITenantConfig>([QueryKeys.adminConfig], ApiRoutes.manageConfig);

  const saveMutation = useMutationQuery<Record<string, unknown>, ITenantConfig>(
    ApiRoutes.manageConfig,
    { method: 'patch', invalidate: [[QueryKeys.adminConfig], [QueryKeys.tenantConfig]] },
  );

  useEffect(() => {
    if (configQuery.data) {
      setValues(toSettingsValues(configQuery.data));
    }
  }, [configQuery.data]);

  const passwordMutation = useMutationQuery<
    { currentPassword: string; newPassword: string },
    { changed: boolean }
  >(ApiRoutes.managePasswordUpdate, { method: 'patch' });

  const handlePasswordSubmit = useCallback((currentPassword: string, newPassword: string) => {
    setPasswordMessage(null);
    setPasswordError(null);
    passwordMutation.mutate({ currentPassword, newPassword }, {
      onSuccess: () => setPasswordMessage(PasswordTexts.changed),
      onError: (mutationError) => setPasswordError(mutationError.message),
    });
  }, [passwordMutation]);

  const handleSave = useCallback(() => {
    if (!values) {
      return;
    }

    setMessage(null);
    setError(null);

    saveMutation.mutate(toSettingsPatch(values), {
      onSuccess: () => setMessage(SettingsTexts.saved),
      onError: (saveError) => setError(saveError.message),
    });
  }, [values, saveMutation]);

  return (
    <Screen padded={false}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.replace(toHref(AppRoutes.admin))}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="chevron-left" size={20} />
        </Pressable>

        <Text className="flex-1 text-xl font-extrabold tracking-tight text-content">
          {SettingsTexts.title}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-10"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <If
          condition={Boolean(values)}
          fallback={(
            <View className="gap-3">
              <View className="h-32 rounded-2xl border border-line/40 bg-surface/60" />
              <View className="h-64 rounded-2xl border border-line/40 bg-surface/60" />
            </View>
          )}
        >
          <View className="gap-3 rounded-2xl border border-line bg-surface/60 p-4">
            <Text className="text-sm font-bold text-content">{SettingsTexts.brandBlock}</Text>

            <View className="gap-1.5">
              <Text className={LABEL}>{SettingsTexts.shopTitle}</Text>
              <TextInput
                value={values?.title ?? ''}
                onChangeText={(title) => setValues((current) => (
                  current ? { ...current, title } : current
                ))}
                placeholder="PHENOMEN"
                className={FIELD}
              />
            </View>

            <View className="gap-1.5">
              <Text className={LABEL}>{SettingsTexts.slogan}</Text>
              <TextInput
                value={values?.slogan ?? ''}
                onChangeText={(slogan) => setValues((current) => (
                  current ? { ...current, slogan } : current
                ))}
                placeholder="Твой стиль"
                className={FIELD}
              />
            </View>

            <ImageField
              value={values?.logoUrl ?? ''}
              label={SettingsTexts.logo}
              previewClass="h-20 w-20"
              onChange={(logoUrl) => setValues((current) => (
                current ? { ...current, logoUrl } : current
              ))}
            />
          </View>

          <RenderColors
            values={values as ISettingsValues}
            onChange={(next) => setValues(next)}
          />

          <RenderFields
            values={values as ISettingsValues}
            onChange={(next) => setValues(next)}
          />

          <If condition={Boolean(message)}>
            <Text className="text-sm font-semibold text-success">{message}</Text>
          </If>

          <If condition={Boolean(error)}>
            <Text className="text-sm font-medium text-danger">{error}</Text>
          </If>

          <Button
            title={SettingsTexts.save}
            loading={saveMutation.isPending}
            onPress={handleSave}
          />

          <RenderPassword
            busy={passwordMutation.isPending}
            message={passwordMessage}
            errorMessage={passwordError}
            onSubmit={handlePasswordSubmit}
          />
        </If>
      </ScrollView>
    </Screen>
  );
};
