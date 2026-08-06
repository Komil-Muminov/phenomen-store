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
  <View className="gap-2">
    <Text className="text-sm font-semibold text-content">{OptionLabels[code]}</Text>
    <View className="flex-row flex-wrap gap-2">
      {uniqueOptionValues(product.variants, code).map((value) => {
        const available = isOptionAvailable(product, code, value, selected);
        const active = selected[code] === value;

        return (
          <Pressable
            key={value}
            disabled={!available}
            onPress={() => onSelect(code, value)}
            className={[
              'rounded-brandSm border px-4 py-2 active:bg-surface',
              active ? 'border-primary bg-primary' : 'border-line bg-background',
              available ? 'opacity-100' : 'opacity-40',
            ].join(' ')}
          >
            <Text className={active ? 'text-sm text-onPrimary' : 'text-sm text-content'}>{value}</Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);
