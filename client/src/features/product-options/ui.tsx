import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Icon, If } from '@/shared/ui';
import {
  IAdminAttribute,
  IVariantRow,
  OptionsTexts,
  toggleValue,
} from '@/features/product-options/model';

interface IProps {
  details: IAdminAttribute[];
  options: IAdminAttribute[];
  values: Record<string, string>;
  selected: Record<string, string[]>;
  rows: IVariantRow[];
  enabled: boolean;
  onValueChange: (code: string, value: string) => void;
  onSelect: (code: string, values: string[]) => void;
  onRowChange: (key: string, patch: Partial<IVariantRow>) => void;
  onToggle: (enabled: boolean) => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'rounded-full border px-3 py-1.5';

export const ProductOptions = ({
  details,
  options,
  values,
  selected,
  rows,
  enabled,
  onValueChange,
  onSelect,
  onRowChange,
  onToggle,
}: IProps) => {
  const [draftCode, setDraftCode] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const handleAddValue = useCallback((code: string) => {
    const next = draftValue.trim();

    if (next) {
      onSelect(code, toggleValue(selected[code] ?? [], next));
    }

    setDraftCode(null);
    setDraftValue('');
  }, [draftValue, selected, onSelect]);

  return (
    <View className="gap-5">
      <View className="gap-3 rounded-2xl border border-line bg-surface/60 p-4">
        <Text className="text-sm font-bold text-content">{OptionsTexts.attributesTitle}</Text>

        <If
          condition={details.length > 0}
          fallback={<Text className="text-xs text-muted">{OptionsTexts.attributesEmpty}</Text>}
        >
          <View className="gap-3">
            {details.map((attribute) => (
              <View key={attribute.code} className="gap-1.5">
                <Text className={LABEL}>{attribute.name}</Text>
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

      <View className="gap-3 rounded-2xl border border-line bg-surface/60 p-4">
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
          onPress={() => onToggle(!enabled)}
          className="flex-row items-center gap-3"
        >
          <View
            className={`h-6 w-11 justify-center rounded-full px-0.5 ${enabled ? 'bg-primary' : 'bg-line'}`}
          >
            <View
              className={`h-5 w-5 rounded-full bg-background ${enabled ? 'self-end' : 'self-start'}`}
            />
          </View>
          <Text className="flex-1 text-sm font-bold text-content">
            {OptionsTexts.variantsTitle}
          </Text>
        </Pressable>

        <If condition={enabled}>
          <If
            condition={options.length > 0}
            fallback={<Text className="text-xs text-muted">{OptionsTexts.variantsEmpty}</Text>}
          >
            <View className="gap-3">
              {options.map((option) => (
                <View key={option.code} className="gap-1.5">
                  <Text className={LABEL}>{option.name}</Text>

                  <View className="flex-row flex-wrap gap-2">
                    {option.values.map((item) => (
                      <Pressable
                        key={item}
                        accessibilityRole="button"
                        onPress={() => onSelect(option.code, toggleValue(selected[option.code] ?? [], item))}
                        className={`${CHIP} ${(selected[option.code] ?? []).includes(item) ? 'border-primary bg-primary' : 'border-line bg-background'}`}
                      >
                        <Text
                          className={`text-xs font-semibold ${(selected[option.code] ?? []).includes(item) ? 'text-onPrimary' : 'text-muted'}`}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ))}

                    {(selected[option.code] ?? [])
                      .filter((item) => !option.values.includes(item))
                      .map((item) => (
                        <Pressable
                          key={item}
                          accessibilityRole="button"
                          onPress={() => onSelect(option.code, toggleValue(selected[option.code] ?? [], item))}
                          className={`${CHIP} border-primary bg-primary`}
                        >
                          <Text className="text-xs font-semibold text-onPrimary">{item}</Text>
                        </Pressable>
                      ))}

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setDraftCode(option.code);
                        setDraftValue('');
                      }}
                      className={`${CHIP} flex-row items-center gap-1 border-dashed border-line`}
                    >
                      <Icon name="plus" size={12} />
                      <Text className="text-xs font-semibold text-primary">
                        {OptionsTexts.newValue}
                      </Text>
                    </Pressable>
                  </View>

                  <If condition={draftCode === option.code}>
                    <View className="flex-row gap-2">
                      <TextInput
                        autoFocus
                        value={draftValue}
                        onChangeText={setDraftValue}
                        placeholder={OptionsTexts.valuePlaceholder}
                        onSubmitEditing={() => handleAddValue(option.code)}
                        className={`flex-1 ${FIELD}`}
                      />
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleAddValue(option.code)}
                        className="items-center justify-center rounded-2xl bg-primary px-4 active:opacity-80"
                      >
                        <Icon name="check" size={16} color="#ffffff" />
                      </Pressable>
                    </View>
                  </If>
                </View>
              ))}
            </View>
          </If>

          <If condition={rows.length > 0}>
            <View className="gap-2">
              <Text className="text-xs text-muted">
                {`${OptionsTexts.combinations}: ${rows.length}. ${OptionsTexts.priceHint}`}
              </Text>

              {rows.map((row) => (
                <View
                  key={row.key}
                  className="gap-2 rounded-xl border border-line bg-background p-3"
                >
                  <Text className="text-xs font-semibold text-content">
                    {Object.values(row.options).join(' · ')}
                  </Text>

                  <View className="flex-row gap-2">
                    <TextInput
                      value={row.price === null ? '' : String(row.price)}
                      onChangeText={(next) => onRowChange(row.key, {
                        price: next ? Number(next) : null,
                      })}
                      keyboardType="numeric"
                      placeholder={OptionsTexts.pricePlaceholder}
                      className={`flex-1 ${FIELD}`}
                    />
                    <TextInput
                      value={String(row.stock)}
                      onChangeText={(next) => onRowChange(row.key, { stock: Number(next) || 0 })}
                      keyboardType="numeric"
                      placeholder={OptionsTexts.stockPlaceholder}
                      className={`flex-1 ${FIELD}`}
                    />
                  </View>
                </View>
              ))}
            </View>
          </If>
        </If>
      </View>
    </View>
  );
};
