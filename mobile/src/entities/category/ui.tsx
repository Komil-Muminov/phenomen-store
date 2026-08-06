import { Image, Pressable, Text, View } from 'react-native';
import { CategoryPlaceholderImage, ICategory } from '@/entities/category/model';

interface IProps {
  category: ICategory;
  onPress: (category: ICategory) => void;
}

export const CategoryTile = ({ category, onPress }: IProps) => (
  <Pressable
    onPress={() => onPress(category)}
    className={({ pressed }) => [
      'w-28 items-center gap-2 rounded-brandMd border p-2',
      pressed ? 'border-primary bg-surface' : 'border-line bg-background',
    ].join(' ')}
  >
    <View className="h-16 w-16 overflow-hidden rounded-brandLg bg-surface">
      <Image
        source={{ uri: category.imageUrl ?? CategoryPlaceholderImage }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
    <Text numberOfLines={2} className="text-center text-xs text-content">{category.name}</Text>
  </Pressable>
);
