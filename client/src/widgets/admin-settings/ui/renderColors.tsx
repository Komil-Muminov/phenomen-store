import { Pressable, Text, TextInput, View } from 'react-native';
import {
  ColorFields,
  ColorPresets,
  ISettingsValues,
  SettingsTexts,
  isHexValid,
  maskHex,
} from '@/widgets/admin-settings/model';

interface IProps {
  values: ISettingsValues;
  onChange: (values: ISettingsValues) => void;
}

export const RenderColors = ({ values, onChange }: IProps) => (
  <View className="gap-4 rounded-2xl border border-line bg-surface/60 p-4">
    <View className="gap-1">
      <Text className="text-sm font-bold text-content">{SettingsTexts.colorsBlock}</Text>
      <Text className="text-xs text-muted">{SettingsTexts.colorsHint}</Text>
    </View>

    {ColorFields.map((field) => (
      <View key={field.key} className="gap-2">
        <View className="flex-row items-center gap-3">
          <View
            style={{ backgroundColor: isHexValid(values.colors[field.key] ?? '')
              ? values.colors[field.key]
              : field.fallback }}
            className="h-10 w-10 rounded-xl border border-line"
          />

          <View className="flex-1 gap-0.5">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
              {field.label}
            </Text>
            <TextInput
              value={values.colors[field.key] ?? ''}
              onChangeText={(next) => onChange({
                ...values,
                colors: { ...values.colors, [field.key]: maskHex(next) },
              })}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={7}
              placeholder={field.fallback}
              className={`rounded-xl border bg-surface px-3 py-2 font-mono text-sm text-content ${isHexValid(values.colors[field.key] ?? '') ? 'border-line' : 'border-danger'}`}
            />
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {ColorPresets.map((preset) => (
            <Pressable
              key={preset}
              accessibilityRole="button"
              accessibilityLabel={`${field.label}: ${preset}`}
              onPress={() => onChange({
                ...values,
                colors: { ...values.colors, [field.key]: preset },
              })}
              style={{ backgroundColor: preset }}
              className={`h-8 w-8 rounded-lg border-2 ${values.colors[field.key]?.toLowerCase() === preset ? 'border-primary' : 'border-line'}`}
            />
          ))}
        </View>
      </View>
    ))}
  </View>
);
