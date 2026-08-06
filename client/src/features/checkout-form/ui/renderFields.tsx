import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon, If } from '@/shared/ui';
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
  <View className="gap-1.5">
    <Text className="text-xs font-semibold text-muted">{FieldLabels[field]}</Text>
    <TextInput
      value={form[field]}
      onChangeText={(value) => onChange(field, value)}
      placeholder={FieldLabels[field]}
      placeholderTextColor="#a3a3a3"
      multiline={multiline}
      keyboardType={keyboardType ?? 'default'}
      style={multiline ? undefined : { paddingVertical: 0 }}
      textAlignVertical={multiline ? 'top' : 'center'}
      className={[
        'rounded-xl border bg-surface px-4 py-3 text-sm font-medium text-content',
        multiline ? 'h-24 pt-3' : 'h-12',
        error ? 'border-danger/60 bg-danger/5' : 'border-line',
      ].join(' ')}
    />
    <If condition={Boolean(error)}>
      <Text className="text-xs font-medium text-danger">{error}</Text>
    </If>
  </View>
);

export const OptionSelector = ({ options, labels, value, error, onSelect }: IOptionsProps) => (
  <View className="gap-2">
    <View className="flex-row flex-wrap gap-2.5">
      {options.map((option) => {
        const active = value === option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            className={[
              'flex-1 min-w-[130px] flex-row items-center justify-between rounded-xl border px-4 py-3.5 active:scale-98',
              active ? 'border-primary bg-primary' : 'border-line bg-surface/50',
            ].join(' ')}
          >
            <Text className={active ? 'text-xs font-bold text-onPrimary' : 'text-xs font-semibold text-content'}>
              {labels[option] ?? option}
            </Text>
            <If condition={active}>
              <Icon name="check" size={14} color="#ffffff" />
            </If>
          </Pressable>
        );
      })}
    </View>
    <If condition={Boolean(error)}>
      <Text className="text-xs font-medium text-danger">{error}</Text>
    </If>
  </View>
);
