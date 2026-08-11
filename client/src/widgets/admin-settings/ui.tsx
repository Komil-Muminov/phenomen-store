import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { extractErrorMessage, uploadImage } from '@/shared/api';
import { ApiRoutes, AppRoutes, QueryKeys } from '@/shared/config';
import { useGetQuery, useMutationQuery } from '@/shared/hooks';
import { Button, ButtonVariants, Icon, If, Screen } from '@/shared/ui';
import {
  ISettingsValues,
  ITenantConfig,
  SettingsTexts,
  toSettingsPatch,
  toSettingsValues,
} from '@/widgets/admin-settings/model';
import { RenderFields } from '@/widgets/admin-settings/ui/renderFields';

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const AdminSettings = () => {
  const router = useRouter();
  const [values, setValues] = useState<ISettingsValues | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handlePickLogo = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Нужен доступ к галерее');

      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });

    if (picked.canceled) {
      return;
    }

    const asset = picked.assets[0];

    setUploading(true);
    setError(null);

    uploadImage<{ url: string }>(ApiRoutes.manageMediaUpload, {
      uri: asset.uri,
      name: asset.fileName ?? `logo-${Date.now()}.png`,
      type: asset.mimeType ?? 'image/png',
    })
      .then((result) => setValues((current) => (
        current ? { ...current, logoUrl: result.url } : current
      )))
      .catch((uploadError: unknown) => setError(extractErrorMessage(uploadError)))
      .finally(() => setUploading(false));
  }, []);

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
          onPress={() => router.replace(AppRoutes.admin)}
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

            <View className="gap-2">
              <Text className={LABEL}>{SettingsTexts.logo}</Text>

              <View className="flex-row items-center gap-3">
                <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-line bg-background">
                  <If
                    condition={Boolean(values?.logoUrl)}
                    fallback={<Icon name="bag" size={20} />}
                  >
                    <Image
                      source={{ uri: values?.logoUrl }}
                      className="h-full w-full"
                      resizeMode="contain"
                    />
                  </If>
                </View>

                <View className="flex-1 gap-2">
                  <Button
                    title={values?.logoUrl ? SettingsTexts.replaceLogo : SettingsTexts.addLogo}
                    variant={ButtonVariants.secondary}
                    loading={uploading}
                    onPress={handlePickLogo}
                  />

                  <If condition={Boolean(values?.logoUrl)}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setValues((current) => (
                        current ? { ...current, logoUrl: '' } : current
                      ))}
                      className="items-center py-1"
                    >
                      <Text className="text-xs font-semibold text-danger">
                        {SettingsTexts.removeLogo}
                      </Text>
                    </Pressable>
                  </If>
                </View>
              </View>
            </View>
          </View>

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
            loading={saveMutation.isPending || uploading}
            onPress={handleSave}
          />
        </If>
      </ScrollView>
    </Screen>
  );
};
