import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import {
  FormTexts,
  ITenantFormValues,
  KEY_PATTERN,
  TenantPlans,
  TenantVerticals,
} from '@/widgets/admin-tenants/model';

interface IProps {
  open: boolean;
  editing: boolean;
  values: ITenantFormValues;
  saving: boolean;
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
              placeholder="my-shop"
              className={FIELD}
            />
            <Text className="text-xs text-muted">{FormTexts.keyHint}</Text>
          </View>
        </If>

        <View className="gap-1.5">
          <Text className={LABEL}>{FormTexts.nameLabel}</Text>
          <TextInput
            value={values.name}
            onChangeText={(name) => onChange({ ...values, name })}
            placeholder="Мой магазин"
            className={FIELD}
          />
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
              placeholder={FormTexts.ownerNameLabel}
              className={FIELD}
            />
            <TextInput
              value={values.ownerLogin}
              onChangeText={(ownerLogin) => onChange({ ...values, ownerLogin })}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={FormTexts.ownerLoginLabel}
              className={FIELD}
            />
            <TextInput
              value={values.ownerPassword}
              onChangeText={(ownerPassword) => onChange({ ...values, ownerPassword })}
              secureTextEntry
              placeholder={FormTexts.ownerPasswordLabel}
              className={FIELD}
            />
          </View>
        </If>

        <If condition={Boolean(errorMessage)}>
          <Text className="text-sm font-medium text-danger">{errorMessage}</Text>
        </If>

        <View className="gap-2 pt-2">
          <Button
            title={FormTexts.save}
            loading={saving}
            disabled={!values.name.trim() || (!editing && !KEY_PATTERN.test(values.key))}
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
