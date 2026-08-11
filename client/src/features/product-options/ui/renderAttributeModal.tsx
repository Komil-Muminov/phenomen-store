import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ButtonVariants, Icon } from '@/shared/ui';
import { AttributeTexts, IAttributeDraft } from '@/features/product-options/model';

interface IProps {
  draft: IAttributeDraft | null;
  isBusy: boolean;
  onChange: (patch: Partial<IAttributeDraft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'rounded-full border px-3 py-1.5';

export const RenderAttributeModal = ({
  draft,
  isBusy,
  onChange,
  onSubmit,
  onCancel,
}: IProps) => (
  <Modal visible={Boolean(draft)} animationType="slide" onRequestClose={onCancel}>
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-14">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={AttributeTexts.cancel}
          onPress={onCancel}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface active:opacity-80"
        >
          <Icon name="close" size={18} />
        </Pressable>

        <Text className="flex-1 text-lg font-extrabold text-content">
          {draft?.id ? AttributeTexts.editTitle : AttributeTexts.createTitle}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pb-8 pt-4">
        <View className="gap-1.5">
          <Text className={LABEL}>{AttributeTexts.nameLabel}</Text>
          <TextInput
            autoFocus
            value={draft?.name ?? ''}
            onChangeText={(name) => onChange({ name })}
            placeholder={draft?.isVariantOption
              ? AttributeTexts.optionPlaceholder
              : AttributeTexts.detailPlaceholder}
            className={FIELD}
          />
        </View>

        <View className="gap-1.5">
          <Text className={LABEL}>{AttributeTexts.kindLabel}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => onChange({ isVariantOption: true })}
              className={`${CHIP} ${draft?.isVariantOption ? 'border-primary bg-primary' : 'border-line bg-surface'}`}
            >
              <Text
                className={`text-xs font-semibold ${draft?.isVariantOption ? 'text-onPrimary' : 'text-muted'}`}
              >
                {AttributeTexts.kindOption}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => onChange({ isVariantOption: false })}
              className={`${CHIP} ${draft?.isVariantOption ? 'border-line bg-surface' : 'border-primary bg-primary'}`}
            >
              <Text
                className={`text-xs font-semibold ${draft?.isVariantOption ? 'text-muted' : 'text-onPrimary'}`}
              >
                {AttributeTexts.kindDetail}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: draft?.isFilterable !== false }}
          onPress={() => onChange({ isFilterable: !(draft?.isFilterable ?? true) })}
          className="flex-row items-center gap-3"
        >
          <View
            className={`h-6 w-11 justify-center rounded-full px-0.5 ${draft?.isFilterable !== false ? 'bg-primary' : 'bg-line'}`}
          >
            <View
              className={`h-5 w-5 rounded-full bg-background ${draft?.isFilterable !== false ? 'self-end' : 'self-start'}`}
            />
          </View>
          <Text className="flex-1 text-sm font-medium text-content">
            {AttributeTexts.filterableLabel}
          </Text>
        </Pressable>

        <View className="gap-1.5">
          <Text className={LABEL}>{AttributeTexts.positionLabel}</Text>
          <TextInput
            value={draft?.position ?? ''}
            onChangeText={(position) => onChange({ position })}
            keyboardType="numeric"
            className={FIELD}
          />
          <Text className="text-xs text-muted">{AttributeTexts.positionHint}</Text>
        </View>

        <View className="gap-2 pt-2">
          <Button
            title={AttributeTexts.save}
            loading={isBusy}
            disabled={!draft?.name.trim()}
            onPress={onSubmit}
          />
          <Button
            title={AttributeTexts.cancel}
            variant={ButtonVariants.secondary}
            onPress={onCancel}
          />
        </View>
      </ScrollView>
    </View>
  </Modal>
);
