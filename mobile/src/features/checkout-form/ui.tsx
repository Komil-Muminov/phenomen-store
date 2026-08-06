import { Text, View } from 'react-native';
import { DeliveryLabels, DeliveryMethods, ICartTotals, PaymentLabels } from '@/entities/cart';
import { formatPrice } from '@/shared/lib';
import { Button, If } from '@/shared/ui';
import {
  ICheckoutForm,
  SectionLabels,
  TCheckoutField,
} from '@/features/checkout-form/model';
import { FormField, OptionSelector } from '@/features/checkout-form/ui/renderFields';

interface IProps {
  form: ICheckoutForm;
  errors: Partial<Record<TCheckoutField, string>>;
  totals: ICartTotals;
  currencySymbol: string;
  deliveryMethods: string[];
  paymentMethods: string[];
  busy: boolean;
  submitError: string | null;
  onChange: (field: TCheckoutField, value: string) => void;
  onSubmit: () => void;
}

export const CheckoutForm = ({
  form,
  errors,
  totals,
  currencySymbol,
  deliveryMethods,
  paymentMethods,
  busy,
  submitError,
  onChange,
  onSubmit,
}: IProps) => (
  <View className="gap-6 px-4 pb-10">
    <View className="gap-3">
      <Text className="text-base font-semibold text-content">{SectionLabels.contacts}</Text>
      <FormField field="name" form={form} error={errors.name} onChange={onChange} />
      <FormField field="phone" form={form} error={errors.phone} keyboardType="phone-pad" onChange={onChange} />
      <FormField field="email" form={form} error={errors.email} keyboardType="email-address" onChange={onChange} />
    </View>

    <View className="gap-3">
      <Text className="text-base font-semibold text-content">{SectionLabels.delivery}</Text>
      <OptionSelector
        options={deliveryMethods}
        labels={DeliveryLabels}
        value={form.deliveryMethod}
        onSelect={(value) => onChange('deliveryMethod', value)}
      />
      <If condition={form.deliveryMethod === DeliveryMethods.courier}>
        <FormField field="address" form={form} error={errors.address} onChange={onChange} />
      </If>
      <FormField field="comment" form={form} multiline onChange={onChange} />
    </View>

    <View className="gap-3">
      <Text className="text-base font-semibold text-content">{SectionLabels.payment}</Text>
      <OptionSelector
        options={paymentMethods}
        labels={PaymentLabels}
        value={form.paymentMethod}
        error={errors.paymentMethod}
        onSelect={(value) => onChange('paymentMethod', value)}
      />
    </View>

    <View className="gap-2 rounded-brandLg border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted">Доставка</Text>
        <Text className="text-sm text-content">{formatPrice(totals.deliveryTotal, currencySymbol)}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-content">К оплате</Text>
        <Text className="text-xl font-bold text-content">{formatPrice(totals.grandTotal, currencySymbol)}</Text>
      </View>
    </View>

    <If condition={Boolean(submitError)}>
      <Text className="text-sm text-danger">{submitError}</Text>
    </If>

    <Button title={SectionLabels.submit} loading={busy} onPress={onSubmit} />
  </View>
);
