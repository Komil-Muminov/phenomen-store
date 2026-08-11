import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Icon, If } from '@/shared/ui';
import { AttributeTexts, IAdminAttribute, OptionsTexts } from '@/features/product-options/model';

interface IProps {
  details: IAdminAttribute[];
  values: Record<string, string>;
  onValueChange: (code: string, value: string) => void;
  onCreate: () => void;
  onEdit: (attribute: IAdminAttribute) => void;
  onDelete: (attribute: IAdminAttribute) => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'rounded-full border px-3 py-1.5';

export const RenderDetails = ({
  details,
  values,
  onValueChange,
  onCreate,
  onEdit,
  onDelete,
}: IProps) => (
  <View className="gap-3 rounded-2xl border border-line bg-surface/60 p-4">
    <View className="flex-row items-center justify-between gap-2">
      <Text className="text-sm font-bold text-content">{OptionsTexts.attributesTitle}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={onCreate}
        className="flex-row items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5"
      >
        <Icon name="plus" size={11} />
        <Text className="text-xs font-semibold text-primary">{AttributeTexts.addDetail}</Text>
      </Pressable>
    </View>

    <If
      condition={details.length > 0}
      fallback={<Text className="text-xs text-muted">{OptionsTexts.attributesEmpty}</Text>}
    >
      <View className="gap-3">
        {details.map((attribute) => (
          <View key={attribute.code} className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <Text className={LABEL}>{attribute.name}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Изменить ${attribute.name}`}
                onPress={() => onEdit(attribute)}
              >
                <Icon name="filter" size={11} color="#94a3b8" />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Удалить ${attribute.name}`}
                onPress={() => onDelete(attribute)}
              >
                <Icon name="close" size={11} color="#94a3b8" />
              </Pressable>
            </View>
            <TextInput
              value={values[attribute.code] ?? ''}
              onChangeText={(next) => onValueChange(attribute.code, next)}
              placeholder={OptionsTexts.valuePlaceholder}
              className={FIELD}
            />

            <If condition={attribute.values.length > 0}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 pr-2">
                  {attribute.values.map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      onPress={() => onValueChange(attribute.code, item)}
                      className={`${CHIP} ${values[attribute.code] === item ? 'border-primary bg-primary' : 'border-line bg-background'}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${values[attribute.code] === item ? 'text-onPrimary' : 'text-muted'}`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </If>
          </View>
        ))}
      </View>
    </If>
  </View>
);
