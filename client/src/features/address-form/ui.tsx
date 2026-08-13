import { Text, TextInput, View } from 'react-native';
import { AddressLabels, IAddressValues } from '@/entities/address';
import { Button, ButtonVariants, If } from '@/shared/ui';
import { AddressFormTexts } from '@/features/address-form/model';

interface IProps {
  values: IAddressValues;
  errors: Partial<Record<keyof IAddressValues, string>>;
  isEditing: boolean;
  busy: boolean;
  errorMessage: string | null;
  onChange: (values: IAddressValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const FIELD = 'h-14 rounded-2xl border border-line bg-surface px-4 text-base font-semibold text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

export const AddressForm = ({
  values,
  errors,
  isEditing,
  busy,
  errorMessage,
  onChange,
  onSubmit,
  onCancel,
}: IProps) => (
  <View className="gap-4 rounded-2xl border border-line bg-surface/50 p-4">
    <Text className="text-base font-extrabold text-content">
      {isEditing ? AddressFormTexts.editTitle : AddressFormTexts.createTitle}
    </Text>

    <View className="gap-1.5">
      <Text className={LABEL}>{AddressLabels.title}</Text>
      <TextInput
        value={values.title}
        onChangeText={(title) => onChange({ ...values, title })}
        placeholder={AddressFormTexts.placeholderTitle}
        placeholderTextColor="#a3a3a3"
        editable={!busy}
        style={{ paddingVertical: 0 }}
        textAlignVertical="center"
        className={FIELD}
      />
    </View>

    <View className="gap-1.5">
      <Text className={LABEL}>{AddressLabels.city}</Text>
      <TextInput
        value={values.city}
        onChangeText={(city) => onChange({ ...values, city })}
        placeholder={AddressFormTexts.placeholderCity}
        placeholderTextColor="#a3a3a3"
        editable={!busy}
        style={{ paddingVertical: 0 }}
        textAlignVertical="center"
        className={FIELD}
      />
      <If condition={Boolean(errors.city)}>
        <Text className="text-xs font-semibold text-danger">{errors.city}</Text>
      </If>
    </View>

    <View className="gap-1.5">
      <Text className={LABEL}>{AddressLabels.street}</Text>
      <TextInput
        value={values.street}
        onChangeText={(street) => onChange({ ...values, street })}
        placeholder={AddressFormTexts.placeholderStreet}
        placeholderTextColor="#a3a3a3"
        editable={!busy}
        style={{ paddingVertical: 0 }}
        textAlignVertical="center"
        className={FIELD}
      />
      <If condition={Boolean(errors.street)}>
        <Text className="text-xs font-semibold text-danger">{errors.street}</Text>
      </If>
    </View>

    <View className="flex-row gap-3">
      <View className="flex-1 gap-1.5">
        <Text className={LABEL}>{AddressLabels.house}</Text>
        <TextInput
          value={values.house}
          onChangeText={(house) => onChange({ ...values, house })}
          placeholder={AddressFormTexts.placeholderHouse}
          placeholderTextColor="#a3a3a3"
          editable={!busy}
          style={{ paddingVertical: 0 }}
          textAlignVertical="center"
          className={FIELD}
        />
      </View>
      <View className="flex-1 gap-1.5">
        <Text className={LABEL}>{AddressLabels.apartment}</Text>
        <TextInput
          value={values.apartment}
          onChangeText={(apartment) => onChange({ ...values, apartment })}
          placeholder={AddressFormTexts.placeholderApartment}
          placeholderTextColor="#a3a3a3"
          editable={!busy}
          style={{ paddingVertical: 0 }}
          textAlignVertical="center"
          className={FIELD}
        />
      </View>
    </View>

    <View className="gap-1.5">
      <Text className={LABEL}>{AddressLabels.comment}</Text>
      <TextInput
        value={values.comment}
        onChangeText={(comment) => onChange({ ...values, comment })}
        placeholder={AddressFormTexts.placeholderComment}
        placeholderTextColor="#a3a3a3"
        editable={!busy}
        multiline
        className="min-h-20 rounded-2xl border border-line bg-surface px-4 py-3 text-base font-semibold text-content"
      />
    </View>

    <If condition={Boolean(errorMessage)}>
      <View className="rounded-xl border border-danger/30 bg-danger/10 p-3">
        <Text className="text-sm font-semibold text-danger">{errorMessage}</Text>
      </View>
    </If>

    <View className="flex-row gap-2">
      <View className="flex-1">
        <Button
          title={AddressFormTexts.cancel}
          variant={ButtonVariants.secondary}
          onPress={onCancel}
        />
      </View>
      <View className="flex-1">
        <Button title={AddressFormTexts.submit} loading={busy} onPress={onSubmit} />
      </View>
    </View>
  </View>
);
