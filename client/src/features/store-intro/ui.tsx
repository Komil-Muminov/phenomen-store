import { Image, Pressable, Text, View } from 'react-native';
import { ITenantConfig } from '@/entities/tenant';
import { If } from '@/shared/ui';

interface IProps {
  config: ITenantConfig;
  cartCount: number;
  onCartPress: () => void;
  onProfilePress: () => void;
  onSearchPress: () => void;
}

export const StoreIntro = ({
  config,
  cartCount,
  onCartPress,
  onProfilePress,
  onSearchPress,
}: IProps) => (
  <View className="gap-3 px-4 pb-3 pt-1">
    <View className="flex-row items-center gap-3">
      <If condition={Boolean(config.brand.logoUrl)}>
        <Image
          source={{ uri: config.brand.logoUrl ?? '' }}
          className="h-10 w-10 rounded-brandSm"
          resizeMode="contain"
        />
      </If>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-2xl font-bold text-content">
          {config.brand.title}
        </Text>
        <If condition={Boolean(config.brand.slogan)}>
          <Text numberOfLines={1} className="text-xs text-muted">
            {config.brand.slogan}
          </Text>
        </If>
      </View>
      <Pressable
        onPress={onProfilePress}
        className={({ pressed }) => [
          'h-10 w-10 items-center justify-center rounded-brandSm border',
          pressed ? 'border-primary bg-surface' : 'border-line bg-background',
        ].join(' ')}
      >
        <Text className="text-base text-content">👤</Text>
      </Pressable>
      <Pressable
        onPress={onCartPress}
        className={({ pressed }) => [
          'h-10 flex-row items-center gap-2 rounded-brandSm border px-3',
          pressed ? 'border-primary bg-surface' : 'border-line bg-background',
        ].join(' ')}
      >
        <Text className="text-sm font-medium text-content">🛒</Text>
        <If condition={cartCount > 0}>
          <View className="min-w-5 items-center rounded-full bg-accent px-1.5 py-0.5">
            <Text className="text-[11px] font-bold text-onPrimary">{cartCount}</Text>
          </View>
        </If>
      </Pressable>
    </View>

    <Pressable
      onPress={onSearchPress}
      className={({ pressed }) => [
        'h-11 flex-row items-center gap-2 rounded-brandSm border px-3.5',
        pressed ? 'border-primary bg-surface' : 'border-line bg-surface/60',
      ].join(' ')}
    >
      <Text className="text-sm text-muted">🔍</Text>
      <Text className="flex-1 text-sm text-muted">Поиск товаров...</Text>
    </Pressable>
  </View>
);
