import { Pressable, Text, TextInput, View } from 'react-native';
import {
  DeliveryMethodOptions,
  ISettingsValues,
  PaymentMethodOptions,
  SettingsTexts,
  toggleMethod,
} from '@/widgets/admin-settings/model';

interface IProps {
  values: ISettingsValues;
  onChange: (values: ISettingsValues) => void;
}

const FIELD = 'rounded-2xl border border-line bg-surface px-4 py-3 text-base text-content';

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';

const CHIP = 'rounded-full border px-3 py-1.5';

const BLOCK = 'gap-3 rounded-2xl border border-line bg-surface/60 p-4';

export const RenderFields = ({ values, onChange }: IProps) => (
  <View className="gap-4">
    <View className={BLOCK}>
      <Text className="text-sm font-bold text-content">{SettingsTexts.ordersBlock}</Text>

      <View className="gap-1.5">
        <Text className={LABEL}>{SettingsTexts.minOrderTotal}</Text>
        <TextInput
          value={values.minOrderTotal}
          onChangeText={(minOrderTotal) => onChange({ ...values, minOrderTotal })}
          keyboardType="numeric"
          placeholder="0"
          className={FIELD}
        />
        <Text className="text-xs text-muted">{SettingsTexts.minOrderHint}</Text>
      </View>

      <View className="gap-1.5">
        <Text className={LABEL}>{SettingsTexts.maxItems}</Text>
        <TextInput
          value={values.maxItemsPerOrder}
          onChangeText={(maxItemsPerOrder) => onChange({ ...values, maxItemsPerOrder })}
          keyboardType="numeric"
          placeholder="50"
          className={FIELD}
        />
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: values.guestCheckout }}
        onPress={() => onChange({ ...values, guestCheckout: !values.guestCheckout })}
        className="flex-row items-center gap-3"
      >
        <View
          className={`h-6 w-11 justify-center rounded-full px-0.5 ${values.guestCheckout ? 'bg-primary' : 'bg-line'}`}
        >
          <View
            className={`h-5 w-5 rounded-full bg-background ${values.guestCheckout ? 'self-end' : 'self-start'}`}
          />
        </View>
        <Text className="flex-1 text-sm font-medium text-content">
          {SettingsTexts.guestCheckout}
        </Text>
      </Pressable>

      <View className="gap-1.5">
        <Text className={LABEL}>{SettingsTexts.deliveryMethods}</Text>
        <View className="flex-row flex-wrap gap-2">
          {DeliveryMethodOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => onChange({
                ...values,
                deliveryMethods: toggleMethod(values.deliveryMethods, option.value),
              })}
              className={`${CHIP} ${values.deliveryMethods.includes(option.value) ? 'border-primary bg-primary' : 'border-line bg-background'}`}
            >
              <Text
                className={`text-xs font-semibold ${values.deliveryMethods.includes(option.value) ? 'text-onPrimary' : 'text-muted'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 gap-1.5">
          <Text className={LABEL}>{SettingsTexts.basePrice}</Text>
          <TextInput
            value={values.deliveryBasePrice}
            onChangeText={(deliveryBasePrice) => onChange({ ...values, deliveryBasePrice })}
            keyboardType="numeric"
            placeholder="0"
            className={FIELD}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className={LABEL}>{SettingsTexts.freeFrom}</Text>
          <TextInput
            value={values.deliveryFreeFrom}
            onChangeText={(deliveryFreeFrom) => onChange({ ...values, deliveryFreeFrom })}
            keyboardType="numeric"
            placeholder="—"
            className={FIELD}
          />
        </View>
      </View>

      <Text className="text-xs text-muted">{SettingsTexts.freeFromHint}</Text>

      <View className="gap-1.5">
        <Text className={LABEL}>{SettingsTexts.paymentMethods}</Text>
        <View className="flex-row flex-wrap gap-2">
          {PaymentMethodOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => onChange({
                ...values,
                paymentMethods: toggleMethod(values.paymentMethods, option.value),
              })}
              className={`${CHIP} ${values.paymentMethods.includes(option.value) ? 'border-primary bg-primary' : 'border-line bg-background'}`}
            >
              <Text
                className={`text-xs font-semibold ${values.paymentMethods.includes(option.value) ? 'text-onPrimary' : 'text-muted'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>

    <View className={BLOCK}>
      <Text className="text-sm font-bold text-content">{SettingsTexts.contactsBlock}</Text>

      <View className="gap-1.5">
        <Text className={LABEL}>{SettingsTexts.phone}</Text>
        <TextInput
          value={values.phone}
          onChangeText={(phone) => onChange({ ...values, phone })}
          keyboardType="phone-pad"
          placeholder="+992 900 00 00 00"
          className={FIELD}
        />
      </View>

      <View className="gap-1.5">
        <Text className={LABEL}>{SettingsTexts.email}</Text>
        <TextInput
          value={values.email}
          onChangeText={(email) => onChange({ ...values, email })}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="support@shop.ru"
          className={FIELD}
        />
      </View>
    </View>
  </View>
);
