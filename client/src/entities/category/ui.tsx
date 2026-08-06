import { Image, Pressable, Text, View } from 'react-native';
import { CategoryPlaceholderImage, ICategory } from '@/entities/category/model';

interface IProps {
  category: ICategory;
  onPress: (category: ICategory) => void;
}

export const CategoryTile = ({ category, onPress }: IProps) => (
  <Pressable
    onPress={() => onPress(category)}
    className="w-[94px] items-center gap-2 rounded-2xl border border-line bg-surface/40 p-2.5 active:border-primary active:bg-surface"
  >
    <View className="h-16 w-16 overflow-hidden rounded-full border border-line bg-surface">
      <Image
        source={{ uri: category.imageUrl ?? CategoryPlaceholderImage }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
    <Text numberOfLines={2} className="text-center text-xs font-semibold text-content leading-4">
      {category.name}
    </Text>
  </Pressable>
);
