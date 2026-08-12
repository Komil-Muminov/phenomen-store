import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import {
  FormTexts,
  ITenantFormValues,
  TTenantFormField,
  TenantPlans,
  TenantVerticals,
} from '@/widgets/admin-tenants/model';

interface IProps {
  open: boolean;
  editing: boolean;
  values: ITenantFormValues;
  saving: boolean;
  fieldErrors: Partial<Record<TTenantFormField, string>>;
  errorMessage: string | null;
  onChange: (values: ITenantFormValues) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'rounded-full border px-3 py-1.5';

export const RenderTenantForm = ({
  open,
  editing,
  values,
  saving,
  fieldErrors,
  errorMessage,
  onChange,
  onSubmit,
  onClose,
}: IProps) => (
  <Modal visible={open} animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={FormTexts.cancel}
          onPress={onClose}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="close" size={18} />
        </Pressable>

        <Text className="flex-1 text-lg font-extrabold text-content">
          {editing ? FormTexts.editTitle : FormTexts.createTitle}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <If condition={!editing}>
          <View className="gap-1.5">
            <Text className={LABEL}>{FormTexts.keyLabel}</Text>
            <TextInput
              value={values.key}
              onChangeText={(key) => onChange({ ...values, key: key.toLowerCase() })}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              placeholder="my-shop"
              className={FIELD}
            />
            <If
              condition={Boolean(fieldErrors.key)}
              fallback={<Text className="text-xs text-muted">{FormTexts.keyHint}</Text>}
            >
              <Text className="text-xs font-semibold text-danger">{fieldErrors.key}</Text>
            </If>
          </View>
        </If>

        <View className="gap-1.5">
          <Text className={LABEL}>{FormTexts.nameLabel}</Text>
          <TextInput
            value={values.name}
            onChangeText={(name) => onChange({ ...values, name })}
            autoComplete="off"
            placeholder="Мой магазин"
            className={FIELD}
          />
          <If condition={Boolean(fieldErrors.name)}>
            <Text className="text-xs font-semibold text-danger">{fieldErrors.name}</Text>
          </If>
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{FormTexts.verticalLabel}</Text>
          <View className="flex-row flex-wrap gap-2">
            {TenantVerticals.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => onChange({ ...values, vertical: item })}
                className={`${CHIP} ${values.vertical === item ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
              >
                <Text
                  className={`text-xs font-semibold ${values.vertical === item ? 'text-onPrimary' : 'text-muted'}`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{FormTexts.planLabel}</Text>
          <View className="flex-row flex-wrap gap-2">
            {TenantPlans.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => onChange({ ...values, plan: item })}
                className={`${CHIP} ${values.plan === item ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
              >
                <Text
                  className={`text-xs font-semibold ${values.plan === item ? 'text-onPrimary' : 'text-muted'}`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{FormTexts.bundleLabel}</Text>
          <TextInput
            value={values.bundleId}
            onChangeText={(bundleId) => onChange({ ...values, bundleId })}
            autoCapitalize="none"
            autoComplete="off"
            placeholder="store.phenomen.myshop"
            className={FIELD}
          />
        </View>

        <If condition={!editing}>
          <View className="gap-3 rounded-2xl border border-line bg-surface/60 p-4">
            <Text className="text-sm font-bold text-content">{FormTexts.ownerBlock}</Text>
            <Text className="text-xs text-muted">{FormTexts.ownerHint}</Text>

            <TextInput
              value={values.ownerName}
              onChangeText={(ownerName) => onChange({ ...values, ownerName })}
              autoComplete="off"
              placeholder={FormTexts.ownerNameLabel}
              className={FIELD}
            />
            <TextInput
              value={values.ownerLogin}
              onChangeText={(ownerLogin) => onChange({ ...values, ownerLogin })}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              keyboardType="email-address"
              placeholder={FormTexts.ownerLoginLabel}
              className={FIELD}
            />
            <If condition={Boolean(fieldErrors.ownerLogin)}>
              <Text className="text-xs font-semibold text-danger">{fieldErrors.ownerLogin}</Text>
            </If>
            <TextInput
              value={values.ownerPassword}
              onChangeText={(ownerPassword) => onChange({ ...values, ownerPassword })}
              secureTextEntry
              autoComplete="off"
              placeholder={FormTexts.ownerPasswordLabel}
              className={FIELD}
            />
            <If condition={Boolean(fieldErrors.ownerPassword)}>
              <Text className="text-xs font-semibold text-danger">
                {fieldErrors.ownerPassword}
              </Text>
            </If>
          </View>
        </If>

        <If condition={Boolean(errorMessage)}>
          <Text className="text-sm font-medium text-danger">{errorMessage}</Text>
        </If>

        <View className="gap-2 pt-2">
          <Button
            title={FormTexts.save}
            loading={saving}
            disabled={saving}
            onPress={onSubmit}
          />
          <Button
            title={FormTexts.cancel}
            variant={ButtonVariants.secondary}
            onPress={onClose}
          />
        </View>
      </ScrollView>
    </View>
  </Modal>
);
