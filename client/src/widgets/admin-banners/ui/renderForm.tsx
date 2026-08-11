import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, Icon, If, ImageField } from '@/shared/ui';
import {
  BannerActionOptions,
  BannerActionTypes,
  BannersTexts,
  IBannerFormValues,
  isDateValid,
  maskDate,
} from '@/widgets/admin-banners/model';

interface IPickerItem {
  id: string;
  name: string;
}

interface IProps {
  open: boolean;
  editing: boolean;
  values: IBannerFormValues;
  categories: IPickerItem[];
  products: IPickerItem[];
  saving: boolean;
  onChange: (values: IBannerFormValues) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'rounded-full border px-3 py-1.5';

export const RenderBannerForm = ({
  open,
  editing,
  values,
  categories,
  products,
  saving,
  onChange,
  onSubmit,
  onClose,
}: IProps) => {
  const targets = values.actionType === BannerActionTypes.category ? categories : products;

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={BannersTexts.cancel}
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
          >
            <Icon name="close" size={18} />
          </Pressable>

          <Text className="flex-1 text-lg font-extrabold text-content">
            {editing ? BannersTexts.edit : BannersTexts.create}
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
          <ImageField
            stacked
            value={values.imageUrl}
            label={BannersTexts.imageLabel}
            previewClass="h-40 w-full"
            onChange={(imageUrl) => onChange({ ...values, imageUrl })}
          />

          <View className="gap-1.5">
            <Text className={LABEL}>{BannersTexts.titleLabel}</Text>
            <TextInput
              value={values.title}
              onChangeText={(title) => onChange({ ...values, title })}
              placeholder="Новая коллекция"
              className={FIELD}
            />
          </View>

          <View className="gap-1.5">
            <Text className={LABEL}>{BannersTexts.subtitleLabel}</Text>
            <TextInput
              value={values.subtitle}
              onChangeText={(subtitle) => onChange({ ...values, subtitle })}
              placeholder="Осень-зима уже в продаже"
              className={FIELD}
            />
          </View>

          <View className="gap-2">
            <Text className={LABEL}>{BannersTexts.actionLabel}</Text>

            <View className="flex-row flex-wrap gap-2">
              {BannerActionOptions.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => onChange({
                    ...values,
                    actionType: option.value,
                    actionValue: null,
                  })}
                  className={`${CHIP} ${values.actionType === option.value ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
                >
                  <Text
                    className={`text-xs font-semibold ${values.actionType === option.value ? 'text-onPrimary' : 'text-muted'}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <If condition={values.actionType === BannerActionTypes.link}>
              <TextInput
                value={values.actionValue ?? ''}
                onChangeText={(actionValue) => onChange({ ...values, actionValue })}
                placeholder={BannersTexts.linkPlaceholder}
                autoCapitalize="none"
                keyboardType="url"
                className={FIELD}
              />
            </If>

            <If
              condition={values.actionType === BannerActionTypes.category
                || values.actionType === BannerActionTypes.product}
            >
              <View className="flex-row flex-wrap gap-2">
                {targets.map((target) => (
                  <Pressable
                    key={target.id}
                    accessibilityRole="button"
                    onPress={() => onChange({ ...values, actionValue: target.id })}
                    className={`${CHIP} ${values.actionValue === target.id ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${values.actionValue === target.id ? 'text-onPrimary' : 'text-muted'}`}
                    >
                      {target.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </If>
          </View>

          <View className="gap-2">
            <Text className={LABEL}>{BannersTexts.periodLabel}</Text>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted">{BannersTexts.periodFrom}</Text>
                <TextInput
                  value={values.startsAt}
                  onChangeText={(next) => onChange({ ...values, startsAt: maskDate(next) })}
                  keyboardType="number-pad"
                  placeholder="01.09.2026"
                  maxLength={10}
                  className={`${FIELD} ${isDateValid(values.startsAt) ? '' : 'border-danger'}`}
                />
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-xs text-muted">{BannersTexts.periodTo}</Text>
                <TextInput
                  value={values.endsAt}
                  onChangeText={(next) => onChange({ ...values, endsAt: maskDate(next) })}
                  keyboardType="number-pad"
                  placeholder="30.09.2026"
                  maxLength={10}
                  className={`${FIELD} ${isDateValid(values.endsAt) ? '' : 'border-danger'}`}
                />
              </View>
            </View>

            <Text className="text-xs text-muted">{BannersTexts.periodHint}</Text>
          </View>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: values.isActive }}
            onPress={() => onChange({ ...values, isActive: !values.isActive })}
            className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
          >
            <View
              className={`h-6 w-11 justify-center rounded-full px-0.5 ${values.isActive ? 'bg-primary' : 'bg-line'}`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-background ${values.isActive ? 'self-end' : 'self-start'}`}
              />
            </View>
            <Text className="flex-1 text-sm font-semibold text-content">
              {BannersTexts.visibleLabel}
            </Text>
          </Pressable>

          <View className="gap-2 pt-2">
            <Button
              title={BannersTexts.save}
              loading={saving}
              disabled={
                !values.imageUrl
                || !isDateValid(values.startsAt)
                || !isDateValid(values.endsAt)
              }
              onPress={onSubmit}
            />
            <Button
              title={BannersTexts.cancel}
              variant={ButtonVariants.secondary}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
