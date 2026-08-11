import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Icon, If } from '@/shared/ui';
import {
  AttributeTexts,
  IAdminAttribute,
  IAttributeDraft,
  IAttributeHandlers,
  IVariantRow,
  OptionsTexts,
  emptyAttributeDraft,
  toAttributeDraft,
  toAttributePayload,
  toggleValue,
} from '@/features/product-options/model';
import { RenderAttributeModal } from '@/features/product-options/ui/renderAttributeModal';
import { RenderDetails } from '@/features/product-options/ui/renderDetails';

interface IProps extends IAttributeHandlers {
  details: IAdminAttribute[];
  options: IAdminAttribute[];
  values: Record<string, string>;
  selected: Record<string, string[]>;
  rows: IVariantRow[];
  enabled: boolean;
  isAttributeBusy: boolean;
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
  isAttributeBusy,
  onValueChange,
  onSelect,
  onRowChange,
  onToggle,
  onCreateAttribute,
  onUpdateAttribute,
  onDeleteAttribute,
}: IProps) => {
  const [draftCode, setDraftCode] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [attributeDraft, setAttributeDraft] = useState<IAttributeDraft | null>(null);

  const patchAttribute = useCallback((patch: Partial<IAttributeDraft>) => {
    setAttributeDraft((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const handleAttributeSubmit = useCallback(() => {
    if (!attributeDraft?.name.trim()) {
      return;
    }

    const payload = toAttributePayload(attributeDraft);

    if (attributeDraft.id) {
      onUpdateAttribute(attributeDraft.id, payload);
    } else {
      onCreateAttribute(payload);
    }

    setAttributeDraft(null);
  }, [attributeDraft, onCreateAttribute, onUpdateAttribute]);

  const handleAttributeDelete = useCallback((attribute: IAdminAttribute) => {
    Alert.alert(AttributeTexts.deleteTitle, `«${attribute.name}». ${AttributeTexts.deleteHint}`, [
      { text: AttributeTexts.cancel, style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => onDeleteAttribute(attribute.id),
      },
    ]);
  }, [onDeleteAttribute]);

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
      <RenderDetails
        details={details}
        values={values}
        onValueChange={onValueChange}
        onCreate={() => setAttributeDraft(emptyAttributeDraft(false))}
        onEdit={(attribute) => setAttributeDraft(toAttributeDraft(attribute))}
        onDelete={handleAttributeDelete}
      />

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
          <Pressable
            accessibilityRole="button"
            onPress={() => setAttributeDraft(emptyAttributeDraft(true))}
            className="flex-row items-center gap-1 self-start rounded-full border border-dashed border-line px-3 py-1.5"
          >
            <Icon name="plus" size={11} />
            <Text className="text-xs font-semibold text-primary">{AttributeTexts.addOption}</Text>
          </Pressable>
        </If>

        <If condition={enabled}>
          <If
            condition={options.length > 0}
            fallback={<Text className="text-xs text-muted">{OptionsTexts.variantsEmpty}</Text>}
          >
            <View className="gap-3">
              {options.map((option) => (
                <View key={option.code} className="gap-1.5">
                  <View className="flex-row items-center gap-2">
                    <Text className={LABEL}>{option.name}</Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Изменить ${option.name}`}
                      onPress={() => setAttributeDraft(toAttributeDraft(option))}
                    >
                      <Icon name="filter" size={11} color="#94a3b8" />
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Удалить ${option.name}`}
                      onPress={() => handleAttributeDelete(option)}
                    >
                      <Icon name="close" size={11} color="#94a3b8" />
                    </Pressable>
                  </View>

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

      <RenderAttributeModal
        draft={attributeDraft}
        isBusy={isAttributeBusy}
        onChange={patchAttribute}
        onSubmit={handleAttributeSubmit}
        onCancel={() => setAttributeDraft(null)}
      />
    </View>
  );
};
