import { useCallback, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ApiRoutes, ManageUnits } from '@/shared/config';
import { extractErrorMessage, uploadImage } from '@/shared/api';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import { IAdminAttribute, IVariantRow, ProductOptions } from '@/features/product-options';
import {
  IAdminCategory,
  IProductFormValues,
  ProductsTexts,
  isFormValid,
} from '@/widgets/admin-products/model';

interface IProps {
  open: boolean;
  editing: boolean;
  values: IProductFormValues;
  categories: IAdminCategory[];
  details: IAdminAttribute[];
  options: IAdminAttribute[];
  attributeValues: Record<string, string>;
  selected: Record<string, string[]>;
  rows: IVariantRow[];
  hasVariants: boolean;
  saving: boolean;
  onChange: (values: IProductFormValues) => void;
  onCreateCategory: (name: string) => void;
  onAttributeChange: (code: string, value: string) => void;
  onSelect: (code: string, next: string[]) => void;
  onRowChange: (key: string, patch: Partial<IVariantRow>) => void;
  onToggleVariants: (enabled: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const RenderForm = ({
  open,
  editing,
  values,
  categories,
  details,
  options,
  attributeValues,
  selected,
  rows,
  hasVariants,
  saving,
  onChange,
  onCreateCategory,
  onAttributeChange,
  onSelect,
  onRowChange,
  onToggleVariants,
  onSubmit,
  onClose,
}: IProps) => {
  const [uploading, setUploading] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Нужен доступ к галерее');

      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (picked.canceled) {
      return;
    }

    const asset = picked.assets[0];

    setUploading(true);
    setError(null);

    uploadImage<{ url: string }>(ApiRoutes.manageMediaUpload, {
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    })
      .then((result) => onChange({ ...values, media: [...values.media, result.url] }))
      .catch((uploadError: unknown) => setError(extractErrorMessage(uploadError)))
      .finally(() => setUploading(false));
  }, [values, onChange]);

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ProductsTexts.cancel}
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
          >
            <Icon name="close" size={18} />
          </Pressable>

          <Text className="flex-1 text-lg font-extrabold text-content">
            {editing ? ProductsTexts.edit : ProductsTexts.create}
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
          <View className="gap-1.5">
            <Text className={LABEL}>{ProductsTexts.nameLabel}</Text>
            <TextInput
              value={values.name}
              onChangeText={(name) => onChange({ ...values, name })}
              placeholder="Футболка базовая"
              className={FIELD}
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className={LABEL}>{ProductsTexts.priceLabel}</Text>
              <TextInput
                value={values.basePrice}
                onChangeText={(basePrice) => onChange({ ...values, basePrice })}
                keyboardType="numeric"
                placeholder="1500"
                className={FIELD}
              />
            </View>

            <View className="flex-1 gap-1.5">
              <Text className={LABEL}>{ProductsTexts.oldPriceLabel}</Text>
              <TextInput
                value={values.oldPrice}
                onChangeText={(oldPrice) => onChange({ ...values, oldPrice })}
                keyboardType="numeric"
                placeholder="2000"
                className={FIELD}
              />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className={LABEL}>{ProductsTexts.brandLabel}</Text>
            <TextInput
              value={values.brand}
              onChangeText={(brand) => onChange({ ...values, brand })}
              placeholder="PHENOMEN"
              className={FIELD}
            />
          </View>

          <View className="gap-1.5">
            <Text className={LABEL}>{ProductsTexts.unitLabel}</Text>
            <View className="flex-row flex-wrap gap-2">
              {ManageUnits.map((unit) => (
                <Pressable
                  key={unit.value}
                  accessibilityRole="button"
                  onPress={() => onChange({ ...values, unit: unit.value })}
                  className={`rounded-full border px-3 py-1.5 ${values.unit === unit.value ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
                >
                  <Text className={`text-xs font-semibold ${values.unit === unit.value ? 'text-onPrimary' : 'text-muted'}`}>
                    {unit.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text className={LABEL}>{ProductsTexts.categoryLabel}</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={() => onChange({ ...values, categoryId: null })}
                className={`rounded-full border px-3 py-1.5 ${values.categoryId ? 'border-line bg-surface' : 'border-primary bg-primary'}`}
              >
                <Text className={`text-xs font-semibold ${values.categoryId ? 'text-muted' : 'text-onPrimary'}`}>
                  {ProductsTexts.noCategory}
                </Text>
              </Pressable>

              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  onPress={() => onChange({ ...values, categoryId: category.id })}
                  className={`rounded-full border px-3 py-1.5 ${values.categoryId === category.id ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
                >
                  <Text className={`text-xs font-semibold ${values.categoryId === category.id ? 'text-onPrimary' : 'text-muted'}`}>
                    {category.name}
                  </Text>
                </Pressable>
              ))}

              <Pressable
                accessibilityRole="button"
                onPress={() => setCategoryDraft('')}
                className="flex-row items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5"
              >
                <Icon name="plus" size={12} />
                <Text className="text-xs font-semibold text-primary">
                  {ProductsTexts.newCategory}
                </Text>
              </Pressable>
            </View>

            <If condition={categoryDraft !== null}>
              <View className="flex-row gap-2">
                <TextInput
                  autoFocus
                  value={categoryDraft ?? ''}
                  onChangeText={setCategoryDraft}
                  placeholder={ProductsTexts.categoryNamePlaceholder}
                  className={`flex-1 ${FIELD}`}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!categoryDraft?.trim()}
                  onPress={() => {
                    onCreateCategory((categoryDraft ?? '').trim());
                    setCategoryDraft(null);
                  }}
                  className="items-center justify-center rounded-2xl bg-primary px-4 active:opacity-80"
                >
                  <Icon name="check" size={16} color="#ffffff" />
                </Pressable>
              </View>
            </If>
          </View>

          <View className="gap-1.5">
            <Text className={LABEL}>{ProductsTexts.mediaLabel}</Text>
            <View className="flex-row flex-wrap gap-2">
              {values.media.map((url) => (
                <View key={url} className="h-20 w-20 overflow-hidden rounded-xl border border-line">
                  <Image source={{ uri: url }} className="h-full w-full" resizeMode="cover" />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Убрать фото"
                    onPress={() => onChange({
                      ...values,
                      media: values.media.filter((item) => item !== url),
                    })}
                    className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-background/90"
                  >
                    <Icon name="close" size={12} />
                  </Pressable>
                </View>
              ))}

              <Pressable
                accessibilityRole="button"
                disabled={uploading}
                onPress={handlePick}
                className="h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line active:opacity-80"
              >
                <Icon name="plus" size={18} />
              </Pressable>
            </View>
          </View>

          <View className="gap-1.5">
            <Text className={LABEL}>{ProductsTexts.descriptionLabel}</Text>
            <TextInput
              value={values.description}
              onChangeText={(description) => onChange({ ...values, description })}
              multiline
              numberOfLines={4}
              placeholder="Короткое описание"
              className={`${FIELD} h-24`}
              textAlignVertical="top"
            />
          </View>

          <ProductOptions
            details={details}
            options={options}
            values={attributeValues}
            selected={selected}
            rows={rows}
            enabled={hasVariants}
            onValueChange={onAttributeChange}
            onSelect={onSelect}
            onRowChange={onRowChange}
            onToggle={onToggleVariants}
          />

          <If condition={Boolean(error)}>
            <Text className="text-sm font-medium text-danger">{error}</Text>
          </If>

          <View className="gap-2 pt-2">
            <Button
              title={ProductsTexts.save}
              loading={saving || uploading}
              disabled={!isFormValid(values)}
              onPress={onSubmit}
            />
            <Button
              title={ProductsTexts.cancel}
              variant={ButtonVariants.secondary}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
