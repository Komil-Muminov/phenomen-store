import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { CategoryPlaceholderImage, ICategory } from '@/entities/category/model';

interface IProps {
  category: ICategory;
  onPress: (category: ICategory) => void;
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'женщинам': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
  'мужчинам': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
  'аксессуары': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop',
  'обувь': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
};

export const CategoryTile = ({ category, onPress }: IProps) => {
  const nameKey = (category?.name || '').toLowerCase().trim();
  const customFallback = CATEGORY_DEFAULT_IMAGES[nameKey] ?? (
    nameKey.includes('мужч') || nameKey.includes('men')
      ? CATEGORY_DEFAULT_IMAGES['мужчинам']
      : nameKey.includes('женщ') || nameKey.includes('women')
        ? CATEGORY_DEFAULT_IMAGES['женщинам']
        : CategoryPlaceholderImage
  );

  const initialUri = (category?.imageUrl && category.imageUrl.trim().length > 0)
    ? category.imageUrl
    : customFallback;

  const [imageUri, setImageUri] = useState<string>(initialUri);

  return (
    <Pressable
      onPress={() => onPress(category)}
      className="w-[94px] items-center gap-2 rounded-2xl border border-line bg-surface/40 p-2.5 active:border-primary active:bg-surface"
    >
      <View className="h-16 w-16 overflow-hidden rounded-full border border-line bg-surface">
        <Image
          source={{ uri: imageUri }}
          onError={() => setImageUri(customFallback)}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <Text numberOfLines={2} className="text-center text-xs font-semibold text-content leading-4">
        {category.name}
      </Text>
    </Pressable>
  );
};
