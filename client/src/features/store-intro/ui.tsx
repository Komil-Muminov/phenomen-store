import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ITenantConfig } from '@/entities/tenant';
import { AppRoutes } from '@/shared/config';
import { triggerHapticLight } from '@/shared/lib';
import { Icon, If } from '@/shared/ui';

interface IProps {
  config: ITenantConfig;
  cartCount: number;
  onCartPress: () => void;
  onProfilePress: () => void;
  onSearchPress: (query?: string) => void;
}

export const StoreIntro = ({
  config,
  cartCount,
  onCartPress,
  onProfilePress,
  onSearchPress,
}: IProps) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const displayTitle = (config?.brand?.title || 'PHENOMEN').replace(/\s*fashion/i, '').trim();
  const displaySlogan = config?.brand?.slogan && !config.brand.slogan.includes('работает')
    ? config.brand.slogan
    : 'Твой стиль';

  const handleSearchSubmit = () => {
    triggerHapticLight();
    if (searchValue.trim()) {
      onSearchPress(searchValue.trim());
    } else {
      onSearchPress();
    }
  };

  return (
    <View className="gap-3.5 px-4 pb-3 pt-2">
      <View className="flex-row items-center gap-2.5">
        <If condition={Boolean(config.brand.logoUrl)}>
          <Image
            source={{ uri: config.brand.logoUrl ?? '' }}
            className="h-10 w-10 rounded-2xl shadow-xs"
            resizeMode="contain"
          />
        </If>
        <View className="flex-1 shrink">
          <Text numberOfLines={1} className="text-xl font-black tracking-tight text-content">
            {displayTitle}
          </Text>
          <Text numberOfLines={1} className="text-xs font-semibold text-muted">
            {displaySlogan}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            triggerHapticLight();
            router.push(AppRoutes.notifications);
          }}
          className="h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface shadow-xs active:scale-95"
        >
          <Icon name="sparkles" size={18} color="#e11d48" />
        </Pressable>

        <Pressable
          onPress={() => {
            triggerHapticLight();
            onProfilePress();
          }}
          className="h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface shadow-xs active:scale-95"
        >
          <Icon name="user" size={18} />
        </Pressable>

        <Pressable
          onPress={() => {
            triggerHapticLight();
            onCartPress();
          }}
          className="relative h-10 flex-row items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 shadow-xs active:scale-95"
        >
          <Icon name="bag" size={18} />
          <If condition={cartCount > 0}>
            <View className="min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-600 px-1 border border-surface shadow-xs">
              <Text className="text-[10px] font-black text-white">{cartCount}</Text>
            </View>
          </If>
        </Pressable>
      </View>

      {/* Живой инпут поиска на Главном экране */}
      <View className="h-12 flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 shadow-sm">
        <Pressable onPress={handleSearchSubmit}>
          <Icon name="search" size={18} color="#64748b" />
        </Pressable>
        <TextInput
          value={searchValue}
          onChangeText={setSearchValue}
          onFocus={() => {
            if (!searchValue.trim()) {
              onSearchPress();
            }
          }}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          placeholder="Поиск по каталогу..."
          placeholderTextColor="#94a3b8"
          className="flex-1 text-sm font-semibold text-content"
        />
        <If condition={Boolean(searchValue)}>
          <Pressable onPress={() => setSearchValue('')} className="p-1">
            <Icon name="close" size={16} color="#94a3b8" />
          </Pressable>
        </If>
      </View>
    </View>
  );
};
