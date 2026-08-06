import { Pressable, Text, View } from 'react-native';
import { IProduct } from '@/entities/product';
import { uniqueOptionValues } from '@/shared/lib';
import { ISelectedOptions, OptionLabels, isOptionAvailable } from '@/features/product-details/model';

interface IProps {
  product: IProduct;
  code: keyof ISelectedOptions;
  selected: ISelectedOptions;
  onSelect: (code: keyof ISelectedOptions, value: string) => void;
}

export const OptionPicker = ({ product, code, selected, onSelect }: IProps) => (
  <View className="gap-2.5">
    <Text className="text-sm font-bold tracking-tight text-content">{OptionLabels[code]}</Text>
    <View className="flex-row flex-wrap gap-2.5">
      {uniqueOptionValues(product.variants, code).map((value) => {
        const available = isOptionAvailable(product, code, value, selected);
        const active = selected[code] === value;

        return (
          <Pressable
            key={value}
            disabled={!available}
            onPress={() => onSelect(code, value)}
            className={[
              'min-w-[48px] items-center justify-center rounded-xl border px-4 py-2.5 active:scale-95',
              active ? 'border-primary bg-primary' : 'border-line bg-surface/50',
              available ? 'opacity-100' : 'opacity-40',
            ].join(' ')}
          >
            <Text className={active ? 'text-sm font-bold text-onPrimary' : 'text-sm font-medium text-content'}>
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);
