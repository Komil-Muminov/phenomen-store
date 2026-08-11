import { Pressable, Text, View } from 'react-native';
import { IProduct } from '@/entities/product';
import { triggerHapticLight, uniqueOptionValues } from '@/shared/lib';
import { If } from '@/shared/ui';
import { ISelectedOptions, OptionLabels, isOptionAvailable } from '@/features/product-details/model';

interface IProps {
  product?: IProduct;
  code: string;
  values?: string[];
  selected?: string | null;
  onSelect: (value: string) => void;
  label?: string;
  onOpenSizeGuide?: () => void;
  onSizeGuidePress?: () => void;
}

export const OptionPicker = ({
  product,
  code,
  values,
  selected,
  onSelect,
  label,
  onOpenSizeGuide,
  onSizeGuidePress,
}: IProps) => {
  const optionValues = values ?? (product?.variants ? uniqueOptionValues(product.variants, code) : []);
  const handleSizeGuide = onOpenSizeGuide ?? onSizeGuidePress;

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold tracking-tight text-content">
          {label ?? OptionLabels[code] ?? code}
        </Text>
        <If condition={code === 'size' && Boolean(handleSizeGuide)}>
          <Pressable
            onPress={() => {
              triggerHapticLight();
              handleSizeGuide?.();
            }}
            className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1 border border-primary/20 active:bg-primary/20"
          >
            <Text className="text-xs font-extrabold text-primary">📏 Таблица размеров</Text>
          </Pressable>
        </If>
      </View>

      <View className="flex-row flex-wrap gap-2.5">
        {optionValues.map((value) => {
          const available = product ? isOptionAvailable(product, code as keyof ISelectedOptions, value, { size: null, color: null }) : true;
          const active = selected === value;

          return (
            <Pressable
              key={value}
              disabled={!available}
              onPress={() => {
                triggerHapticLight();
                onSelect(value);
              }}
              className={[
                'min-w-[48px] items-center justify-center rounded-2xl border px-4 py-2.5 active:scale-95 relative overflow-hidden',
                active ? 'border-primary bg-primary shadow-xs' : 'border-line bg-surface',
                available ? 'opacity-100' : 'opacity-35 bg-slate-100 border-dashed border-slate-300',
              ].join(' ')}
            >
              <Text
                className={[
                  active ? 'text-sm font-black text-white' : 'text-sm font-semibold text-content',
                  !available ? 'line-through text-slate-400' : '',
                ].join(' ')}
              >
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
