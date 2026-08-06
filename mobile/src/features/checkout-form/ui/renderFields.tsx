import { Pressable, Text, TextInput, View } from 'react-native';
import { If } from '@/shared/ui';
import { FieldLabels, ICheckoutForm, TCheckoutField } from '@/features/checkout-form/model';

interface IFieldProps {
  field: TCheckoutField;
  form: ICheckoutForm;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  onChange: (field: TCheckoutField, value: string) => void;
}

interface IOptionsProps {
  options: string[];
  labels: Record<string, string>;
  value: string;
  error?: string;
  onSelect: (value: string) => void;
}

export const FormField = ({ field, form, error, multiline, keyboardType, onChange }: IFieldProps) => (
  <View className="gap-1">
    <Text className="text-xs text-muted">{FieldLabels[field]}</Text>
    <TextInput
      value={form[field]}
      onChangeText={(value) => onChange(field, value)}
      multiline={multiline}
      keyboardType={keyboardType ?? 'default'}
      className={[
        'rounded-brandSm border bg-background px-3 py-3 text-content',
        multiline ? 'h-20' : 'h-12',
        error ? 'border-danger' : 'border-line',
      ].join(' ')}
    />
    <If condition={Boolean(error)}>
      <Text className="text-xs text-danger">{error}</Text>
    </If>
  </View>
);

export const OptionSelector = ({ options, labels, value, error, onSelect }: IOptionsProps) => (
  <View className="gap-2">
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          className={({ pressed }) => [
            'rounded-brandSm border px-4 py-3',
            value === option ? 'border-primary bg-primary' : 'border-line bg-background',
            pressed && value !== option ? 'bg-surface' : '',
          ].join(' ')}
        >
          <Text className={value === option ? 'text-sm text-onPrimary' : 'text-sm text-content'}>
            {labels[option] ?? option}
          </Text>
        </Pressable>
      ))}
    </View>
    <If condition={Boolean(error)}>
      <Text className="text-xs text-danger">{error}</Text>
    </If>
  </View>
);
