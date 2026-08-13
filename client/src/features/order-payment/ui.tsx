import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  IOrder,
  IPaymentCard,
  PaymentStates,
} from '@/entities/order';
import { formatPrice } from '@/shared/lib';
import { Button, ButtonVariants, Icon, If } from '@/shared/ui';
import { PaymentSheetTexts } from '@/features/order-payment/model';

interface IProps {
  order: IOrder | null;
  card: IPaymentCard | null;
  receiptUrl: string;
  note: string;
  uploading: boolean;
  submitting: boolean;
  errorMessage: string | null;
  onNote: (value: string) => void;
  onPick: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

const ROW = 'flex-row items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3';

export const OrderPayment = ({
  order,
  card,
  receiptUrl,
  note,
  uploading,
  submitting,
  errorMessage,
  onNote,
  onPick,
  onSubmit,
  onClose,
}: IProps) => (
  <Modal visible={Boolean(order)} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/50">
      <View className="max-h-[85%] gap-4 rounded-t-3xl bg-background p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-extrabold text-content">{PaymentSheetTexts.title}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full border border-line active:opacity-70"
          >
            <Icon name="close" size={16} />
          </Pressable>
        </View>

        <ScrollView className="gap-3" keyboardShouldPersistTaps="handled">
          <If
            condition={Boolean(card?.number)}
            fallback={<Text className="text-xs text-muted">{PaymentSheetTexts.cardMissing}</Text>}
          >
            <View className="gap-2">
              <View className={ROW}>
                <Text className="text-xs text-muted">{PaymentSheetTexts.number}</Text>
                <Text className="text-sm font-bold text-content">{card?.number}</Text>
              </View>
              <If condition={Boolean(card?.holder)}>
                <View className={ROW}>
                  <Text className="text-xs text-muted">{PaymentSheetTexts.holder}</Text>
                  <Text className="text-sm font-bold text-content">{card?.holder}</Text>
                </View>
              </If>
              <If condition={Boolean(card?.bank)}>
                <View className={ROW}>
                  <Text className="text-xs text-muted">{PaymentSheetTexts.bank}</Text>
                  <Text className="text-sm font-bold text-content">{card?.bank}</Text>
                </View>
              </If>
              <View className={ROW}>
                <Text className="text-xs text-muted">{PaymentSheetTexts.amount}</Text>
                <Text className="text-sm font-bold text-content">
                  {formatPrice(order?.totals.grandTotal ?? 0, order?.totals.currency ?? '')}
                </Text>
              </View>
              <If condition={Boolean(card?.note)}>
                <Text className="text-xs text-muted">{card?.note}</Text>
              </If>
            </View>

            <Text className="mt-3 text-xs leading-4 text-muted">{PaymentSheetTexts.hint}</Text>

            <If condition={order?.paymentStatus === PaymentStates.review}>
              <View className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3">
                <Text className="text-xs font-semibold text-amber-600">
                  {PaymentSheetTexts.waiting}
                </Text>
              </View>
            </If>

            <If condition={order?.paymentStatus === PaymentStates.failed}>
              <View className="mt-3 rounded-xl border border-danger/30 bg-danger/10 p-3">
                <Text className="text-xs font-semibold text-danger">
                  {PaymentSheetTexts.rejected}
                </Text>
              </View>
            </If>

            <View className="mt-3 gap-2">
              <Button
                title={receiptUrl ? PaymentSheetTexts.replace : PaymentSheetTexts.pick}
                variant={ButtonVariants.secondary}
                loading={uploading}
                onPress={onPick}
              />

              <TextInput
                value={note}
                onChangeText={onNote}
                placeholder={PaymentSheetTexts.note}
                placeholderTextColor="#a3a3a3"
                multiline
                className="min-h-20 rounded-2xl border border-line bg-surface px-4 py-3 text-base font-semibold text-content"
              />

              <If condition={Boolean(errorMessage)}>
                <View className="rounded-xl border border-danger/30 bg-danger/10 p-3">
                  <Text className="text-sm font-semibold text-danger">{errorMessage}</Text>
                </View>
              </If>

              <Button
                title={PaymentSheetTexts.submit}
                loading={submitting}
                disabled={!receiptUrl}
                onPress={onSubmit}
              />
            </View>
          </If>
        </ScrollView>
      </View>
    </View>
  </Modal>
);
